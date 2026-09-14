# Ayni Mesh

The second track of [Ayni](https://ayni-ai.com): a swarm of community desktops and laptops
serving frontier mixture-of-experts models as one model, with Ayni's marketplace layer on
top (quotes, metered earnings per peer, attestation tiers, Council review).

Engine and swarm come from two upstream projects, pinned and unforked:

- [Colibrì](https://github.com/JustVugg/colibri): pure-C inference for 7B to 2.8T MoE models
  on consumer hardware, experts streamed from disk.
- [Lumabri](https://github.com/JustVugg/lumabri): layer-segment and expert peers over a
  tracker, with signed weights, encrypted transport, NAT relay, leases and failover.

Ayni 1.0 (`mcastroarroyo/shared-compute`) keeps running and improving on its own track;
nothing here changes it.

Start with [ASSESSMENT.md](ASSESSMENT.md): what the two projects are, what was measured,
where the fit and the hard problems are, and the plan.

Apache 2.0. See `NOTICE`.
