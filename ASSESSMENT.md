# Ayni mesh peers on Colibrì and Lumabri: fit assessment and plan

Date: 2026-09-14. Status: first-pass evaluation from source, docs and a loopback run on an
M1 Pro with 16 GB. Mesh is not a second product. It is the supply for Ayni's judgment classes (SMALL and up), sold
through the same quote, accept, run and collect API. This repository is an incubator: it holds the
evaluation and experiments until the adapter lands in the main repository as a provider class.
The production marketplace (`ayni-ai.com`, repo `shared-compute`) keeps operating throughout.

## 1. What the two projects are

**Colibrì** (`github.com/JustVugg/colibri`, Apache 2.0, 30k stars, active daily). A pure-C
inference engine, no dependencies, that runs frontier mixture-of-experts models on consumer
hardware by treating VRAM, RAM and disk as one memory hierarchy and streaming only the
experts a token actually routes to. Nine model families run through one command line:
GLM-5.2/5.3 (744B), GLM-5.3-Flash (321B), Inkling (975B), Kimi K3 (2.8T), DeepSeek V4 and
V4.1 Flash (284B/552B), Qwen3.8-Flash-Next (125B), Qwen3.6 (35B), OLMoE (7B). Optional
CUDA, Metal and Vulkan tiers. Measured, not promised: 1.8 tok/s for GLM-5.2 on a 128 GB
CPU-only desktop, 5.8 to 6.8 tok/s on six RTX 5090s. Its rule: placement may change speed,
never semantics; outputs are validated token-exact against a reference.

Two additive C ABIs matter for us. `segment_runtime.h` runs a contiguous range of layers on
a peer and exposes an opaque, snapshot-able session state. `edge_runtime.h` runs the
tokenizer, embedding and final head locally. Colibrì owns the model math; "a consumer such
as Lumabri owns discovery, transport, placement, leases and session lifecycle."

**Lumabri** (`github.com/JustVugg/lumabri`, same author, Apache 2.0, 146 stars, updated
daily). That consumer. It runs one model as a chain of layer-segment peers, or with experts
executed on donor peers, over a tracker. It has: Ed25519 peer identity, X25519 plus
ChaCha20-Poly1305 transport, signed model identity and content-addressed verified weight
distribution, NAT relay through the donor's own outbound tunnel (nothing to configure at
home), leases with fencing epochs and route generations, snapshot and restore so a chat
survives losing a peer, replica re-execution (`LUMABRI_VERIFY=N` percent of calls re-run on
another peer and must match byte for byte), hedging, a household consent flow where every
donor approves before a model loads, and a release gate that rejects any token mismatch
against an oracle. It has no economics, no reputation, no payments, no attestation, and no
phone or browser peers.

Published Lumabri measurements (synthetic OLMoE, experts on peers, 2026-08): network changed
zero of 24 tokens; loopback 7.0 tok/s, gigabit LAN 6.0, emulated internet at 30 ms RTT and
0.1% loss 1.1 tok/s, versus 0.04 tok/s streaming the same experts from a slow local disk.
The chatter's RAM fell from 2.5 GB to 1.0 GB because it never holds an expert.

## 2. What we measured on this Mac today

Both projects build on macOS. Colibrì's model-free C tests pass. Lumabri's `tracker`,
`segment_node`, `segment_chat` and TUI build against the Colibrì checkout.

Two-peer layer-segment chain on loopback with Lumabri's synthetic tiny OLMoE (16 layers,
8 experts per layer, 650 MB, random weights):

| | |
|---|---|
| Route | peer-a layers 0:8 → peer-b layers 8:16, leased and fenced |
| Prefill, 8-token prompt | 0.56 s |
| Decode, 16 tokens | 0.29 s, about 55 tok/s |
| Per hop per token | 8 to 10 ms on loopback |
| Bytes on the wire | 553 KB for the whole run |
| Greedy output across two runs | identical token ids |

Caveats: random weights, so speed is indicative of protocol overhead only; the expert-donor
path (`expert_node`) is Linux-only today (it includes `sys/prctl.h`), so that test needs
the GCP box; the TUI-driven household test failed on a terminal-automation step on macOS,
not on the runtime. The segment node's governor refused work until the RAM reserve was
lowered (`LUMABRI_SEGMENT_RAM_RESERVE_MB`), which on a 16 GB laptop with 3.5 GB free is
the right default behaviour.

### 2a. Real weights on GCP (mesh-dev-1, e2-standard-8, 8 vCPU, no GPU)

OLMoE-1B-7B-Instruct converted to Colibrì's int8 container (7.0 GB) in 3.5 minutes on the VM.

| Path | Result |
|---|---|
| Expert-peer swarm, tiny fixture, 4 peers on loopback (Linux only) | 1,984 remote expert calls, 8.4 ms per layer round, tokens identical to the local engine, incompatible engine build refused, spot-check verification agreed |
| Local Colibrì, real OLMoE, OpenAI server, 48 tokens, temperature 0 | 5.3 to 7.9 s total including prefill of 73 tokens; "The log line is classified as LOW…" |
| Two-peer layer chain, real OLMoE, same templated prompt | prefill 4.0 to 5.5 s, decode 48 tokens at 11.9 to 13.0 tok/s, 3.8 MB on the wire, 30 to 40 ms per stage call |
| Same raw token ids into both paths | generated ids identical up to end-of-sequence (" HIGH") |

Two honest notes. The chain's decode rate on loopback matched the local engine's; the cost of
the network at 0 ms RTT is real prefill latency and 3 to 4 MB of activations per short answer,
which at internet RTT becomes the dominant term. And the model's triage answer changed with
the prompt wording ("HIGH" for the short form, "LOW" with an explanation requested), which is
about the model, not the swarm.

### 2b. First WAN measurement (M1, partial: synthetic model, 2026-09-14)

Tracker and one layer-segment peer on the GCP VM (public IP, firewall to this Mac only), the
other peer on this Mac behind a home NAT as a relay-only donor, the tiny synthetic OLMoE on both
sides so the numbers are network cost, not compute. Round trip Mac to GCP: 87 ms.

| Placement | Decode | Per segment call |
|---|---|---|
| Chatter on the Mac, GCP peer direct, Mac peer via relay | 0.3 to 0.9 tok/s | GCP 200 to 450 ms, Mac relay 1.0 to 3.6 s |
| Chatter on the VM, GCP peer local, Mac peer via relay | 0.5 to 1.6 tok/s | GCP 14 ms, Mac relay 0.7 to 2.2 s |
| Chatter on the Mac, both peers on GCP, direct | 0.9 to 1.2 tok/s | 400 to 700 ms each |

Three conclusions. First, a relay-only home peer costs 0.7 to 2.2 s per call on this link: the
tracker relay plus a home uplink is not a data-plane for sequential layers. Second, even a
direct hop costs 400 to 700 ms per call at 87 ms RTT, which is several round trips per call,
not one; that is protocol overhead worth raising upstream (pipelining or batching the segment
calls). Third, the loopback numbers (9 ms per call) show the engine is not the cost. So the
design rule for the adapter: a route lives inside one low-RTT domain (one region, one LAN, one
private mesh), the chatter is a peer inside that domain, and the buyer submits prompts to the
route through the coordinator. Home peers behind NAT are useful as expert donors for batch
work, not as links in a sequential layer chain. Real-weights WAN numbers follow when the Mac
conversion completes.

### 2c. WAN with real weights (M1 complete for the layer-chain path, 2026-09-14)

Same tracker and firewall as 2b; real OLMoE-1B-7B on both machines; 48-token answers to the
templated triage prompt, temperature 0; the Mac is behind a home NAT and joins as a relay-only
peer where noted. Round trip Mac to GCP: 87 ms.

| Placement | Decode | Per segment call | Prefill (73 tokens) |
|---|---|---|---|
| Mac alone, Colibrì Metal build, OpenAI server | 2.5 tok/s incl. prefill | n/a | included |
| Mac alone, two-peer chain on loopback | 1.6 to 2.6 tok/s | 170 to 300 ms | 14 to 19 s |
| Both peers on GCP, chatter on the Mac (direct) | 3.5 to 3.6 tok/s | 130 to 140 ms | 9 s warm, 38 s cold |
| Chatter and one peer on GCP, Mac as relay-only peer | 4.5 to 4.6 tok/s | GCP 48 ms, Mac via relay 156 to 162 ms | 12 to 14 s |
| For reference: both peers and chatter on GCP (2a) | 12 to 13 tok/s | 30 to 40 ms | 4 to 5.5 s |

Every placement produced the same answer text. Three corrections to 2b now that the model is
real. The 400 to 700 ms per call seen with the synthetic model was not protocol overhead; with
real weights a direct WAN hop costs about one round trip plus compute, and the relay hop through
the tracker costs about 70 ms more than that. A home peer behind NAT is therefore usable as a
link in a layer chain, at roughly one round trip per token per hop; the earlier rule stands as
a preference (keep a route in one low-RTT domain) rather than a prohibition. And the most
useful number for the go-to-market: this 16 GB laptop got faster answers by renting two GCP
peers across the internet (3.5 tok/s) than by running the model itself (1.6 to 2.6 tok/s),
because the laptop is RAM-starved at 7 GB of weights. That is the private-mesh and overflow
story in one measurement. The remaining gap to same-host (12 to 13 tok/s) is the price of the
WAN; batching across sequences is what amortises it, and that is the next measurement.

## 3. Fit with Ayni

The production marketplace already has what Lumabri lacks and lacks what Lumabri has.

| Layer | Ayni today | Colibrì + Lumabri |
|---|---|---|
| Models | one 0.5B on phones and laptops | 7B to 2.8T, frontier MoE |
| Unit of work | whole request on one device | layer segments or experts across peers |
| Privacy | prompt sealed to one device, coordinator relays ciphertext | activations visible to peers in the clear at execution; encrypted only in transit |
| Integrity | redundancy vote, Council on shape | signed weights, replica re-execution, token-exact release gate |
| Discovery, NAT, leases, failover | coordinator over WebSocket, no NAT issue (providers dial out) | tracker, relay tunnels, leases, fencing, snapshot/restore |
| Economics | quotes, credits, payouts, spot, tiers, attestation, Council | none |
| Devices | Android, macOS, Linux, Windows | macOS, Linux; Windows uncertified; no phones |

The strategic point: Ayni's unsolved problem is supply for the judgment classes (SMALL and
up). Colibrì makes a community desktop with a fast SSD a credible server for a 300B-class
model, and Lumabri makes a swarm of them a single model. That is the supply Ayni 1.0 cannot
recruit today, and it is where the price-per-correct-answer argument becomes real.

Ayni's contribution on top is exactly the missing layer: who is allowed to be a peer
(attestation tiers), what a job costs and who gets paid (quotes, metered earnings per
segment or expert call), what runs where (the marketplace scheduler choosing peers by
benchmark, RTT and price), and governance (Council on shape). Phones stay in 1.0 for the
mechanical workloads; mesh peers are the laptop-and-desktop supply for the reasoning workloads.

The hard problems, honestly:

1. **Latency is the wall.** Layers are sequential; every hop costs a round trip. Lumabri's
   own numbers show internet RTT cutting throughput six-fold versus LAN. Batch workloads
   tolerate that (Ayni is batch first), interactive chat does not. Placement must group
   peers by RTT, and batch-union plus speculative drafts amortize hops.
2. **Privacy regresses.** A segment peer sees hidden states, an expert peer sees expert
   inputs. Neither is the prompt, but both leak. The 2.0 trust story is attested peers and
   trusted-peer pools per customer, not the 1.0 "sealed to one device" claim. Say so.
3. **Verification is expensive.** Replica re-execution of N percent of calls is what
   Lumabri has; proof-of-inference is what would make it cheap. Price the buffer.
4. **Windows and phones.** Most of the world's idle desktops run Windows; Lumabri has not
   certified it. Phones have no path in Colibrì today; WebGPU workers are listed as a
   future seam.
5. **Two codebases we do not own.** Both move daily. Build against pinned commits with an
   adapter layer, contribute upstream, do not fork the engine.

## 4. Naming and licence

Both are Apache 2.0, so using, modifying and redistributing the code with the licence and
notices intact is allowed. Apache 2.0 grants no trademark rights (section 6). "Colibrì" is
the upstream project's name and brand; a repository named `ayni-ai/colibri` reads as a
fork of their engine, which is fine for a fork and confusing for a product. Recommendation:
the track is **Ayni Mesh**: repository `Ayni-ai/mesh`, GCP project `ayni-mesh`. Colibrì and
Lumabri stay pinned upstream dependencies with attribution in `NOTICE`; the engine is not
forked.

## 4a. One product, staged merge (decided 2026-09-14)

One product, one brand, one buyer surface. Two engineering tracks until the adapter (M2) proves
a mesh route can register with the coordinator as a provider class; then this incubator folds
into the main repository as a backend in the provider core and a route type in the scheduler,
with upstreams pinned. Infrastructure stays separate until a paying private mesh exists.

The privacy vocabulary grows one entry before the merge. Today `community` and
`device_attested` both mean "the prompt is sealed to one device". A mesh route is different:
several peers, each computing a layer range or an expert set and each seeing the activations
for it, with encrypted transport, signed weights and replica verification. That is documented
and priced as its own route class rather than passed off as the same guarantee; the per-peer
trust tier (community or attested) then applies to every peer in the route.

## 5. Plan

Nothing below changes the production marketplace.

1. **Workspace.** `~/Ayni2/` holds pinned checkouts of `colibri` and `lumabri` and this
   repository (`mesh`). A new GCP project (`ayni-mesh`, separate billing line) hosts a tracker VM
   and one or two donor VMs with local NVMe for real models; nothing shares with
   `ayni1-507216`.
2. **Week 1, prove the engine on real weights.** Convert OLMoE-1B-7B (13.8 GB download,
   7 GB container) and run it locally; run Qwen3.6-35B (20 GB container) and GLM-5.3-Flash
   (195 GB) on a GCP VM with a 96 GB RAM and NVMe. Record tok/s, RAM, disk. Run the
   expert-donor path on Linux, which this Mac cannot.
3. **Week 2, prove the swarm across the internet.** Tracker on GCP, one donor on GCP, one
   donor on the Mac behind NAT via the relay. Measure per-hop RTT, tok/s for a real model,
   snapshot/restore on peer loss, replica verification cost.
4. **Week 3, the Ayni adapter.** A thin service that treats a Lumabri route as an Ayni
   provider: registers peers with benchmark and attestation, prices a workload per segment
   and expert call, meters and accrues earnings per peer, exposes the same quote → accept →
   run API as 1.0 so the MCP server and the Python client work unchanged. Council on shape
   applies as is.
5. **Decide.** Publish the numbers next to 1.0's and next to hosted prices per million
   tokens. If a three-donor swarm on a 300B-class model beats hosted open 70B on price per
   correct answer for batch judgment work, mesh peers are the judgment class of the marketplace.
   If not, the measurements are still the most useful thing we could have learned.

## 5a. State on 2026-09-14

- GitHub: `Ayni-ai/mesh` (public, Apache 2.0) holds this assessment and the experiments.
- GCP: project `ayni-mesh` under `zalesgen.co`, billing linked, Compute enabled. One dev VM
  `mesh-dev-1` (e2-standard-8, 32 GB, 100 GB disk, us-east1-b) builds both upstreams at the
  pinned commits and runs the Linux-only expert-peer test. Delete it when idle; larger NVMe
  machines are created per experiment and deleted after.
- Models: OLMoE-1B-7B-0125-Instruct being converted to Colibrì's int8 container on the Mac
  (`~/Ayni2/models/olmoe`) and on the VM.

## 6. Files in this workspace

- `experiments/chain.sh`: the two-peer loopback run used for the numbers above.
- `experiments/cc-openmp-wrapper`: Apple clang wrapper for Lumabri's GNU-style `-fopenmp`.
- Upstream checkouts: `../colibri` (commit f028d26), `../lumabri` (commit 231f83f).
