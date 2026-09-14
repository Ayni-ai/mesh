# Ayni mesh peers

Incubator for [Ayni](https://ayni-ai.com)'s judgment classes: a swarm of community desktops and
laptops serving frontier mixture-of-experts models as one model, sold through Ayni's existing
marketplace (quotes, metered earnings per peer, attestation tiers, Council review). One product,
not a second one; this repository folds into the main one once the adapter is proven.

Engine and swarm come from two upstream projects, pinned and unforked:

- [Colibrì](https://github.com/JustVugg/colibri): pure-C inference for 7B to 2.8T MoE models
  on consumer hardware, experts streamed from disk.
- [Lumabri](https://github.com/JustVugg/lumabri): layer-segment and expert peers over a
  tracker, with signed weights, encrypted transport, NAT relay, leases and failover.

The production marketplace (`shared-compute`) keeps running and improving throughout; nothing
here changes it until the merge.

Start with [ASSESSMENT.md](ASSESSMENT.md): what the two projects are, what was measured,
where the fit and the hard problems are, and the plan.

Apache 2.0. See `NOTICE`.
