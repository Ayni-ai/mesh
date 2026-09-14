// Ayni Mesh pitch deck — pptxgenjs, 16:9 (10 x 5.625 in). Same brand as the Ayni deck.
const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const Fi = require("react-icons/fi");
const sharp = require("sharp");

const C = { navy: "1B2A63", deep: "131F4A", teal: "1F9E94", tealB: "23B2A6", ink: "14213D", muted: "5A6B86", line: "E9E4D8", panel: "F6F4EE", white: "FFFFFF", tint: "E6F4F2", ntint: "E8ECF7", gold: "C9A227", ok: "1E8449", red: "B23A48" };
const HF = "Arial", BF = "Calibri";
const IMG = path.join(__dirname, "img");
const OUT = process.argv[2] || path.join(__dirname, "out", "Ayni-Mesh-Pitch-Deck.pptx");

async function icon(name, color, px = 256) {
  const svg = renderToStaticMarkup(React.createElement(Fi[name], { color: "#" + color, size: px }));
  return "image/png;base64," + (await sharp(Buffer.from(svg)).png().toBuffer()).toString("base64");
}

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "Ayni · Zalesgen LLC"; pres.title = "Ayni Mesh pitch deck";
  const logo = fs.readFileSync(path.join(IMG, "ayni-logo-t.png")).toString("base64");
  const ic = {};
  for (const n of ["FiSmartphone", "FiCpu", "FiLayers", "FiShield", "FiDollarSign", "FiGlobe", "FiCheckCircle", "FiAlertTriangle", "FiServer", "FiUsers", "FiLock", "FiGitBranch", "FiZap", "FiHome", "FiTrendingUp", "FiEye"]) ic[n] = await icon(n, C.teal);
  ic.FiAlertTriangle = await icon("FiAlertTriangle", C.gold);

  const title = (s, t, o = {}) => s.addText(t, { x: 0.5, y: 0.35, w: 9, h: 0.7, fontFace: HF, fontSize: o.size || 30, bold: true, color: o.color || C.navy, isTextBox: true, margin: 0, valign: "top" });
  const kicker = (s, t, color = C.teal) => s.addText(t.toUpperCase(), { x: 0.5, y: 0.12, w: 6, h: 0.25, fontFace: HF, fontSize: 9, bold: true, color, charSpacing: 3, isTextBox: true, margin: 0 });
  const foot = (s, dark = false) => {
    s.addText("Ayni Mesh · github.com/Ayni-ai/mesh", { x: 0.5, y: 5.25, w: 4.5, h: 0.25, fontFace: BF, fontSize: 9, color: dark ? "9DB0D3" : C.muted, isTextBox: true, margin: 0 });
    if (dark) s.addShape(pres.ShapeType.roundRect, { x: 8.6, y: 5.08, w: 1.0, h: 0.44, fill: { color: C.white }, line: { color: C.white }, rectRadius: 0.06 });
    s.addImage({ data: "image/png;base64," + logo, x: 8.7, y: 5.15, w: 0.8, h: 0.327 });
  };
  const bullets = (s, arr, o) => s.addText(arr.map((t, i) => ({ text: t, options: { bullet: { indent: 12 }, breakLine: i < arr.length - 1, paraSpaceAfter: 6 } })), { fontFace: BF, fontSize: o.size || 12, color: o.color || C.ink, isTextBox: true, valign: "top", margin: 0, ...o });
  const stat = (s, x, y, w, big, label, dark = false, h = 1.25) => {
    s.addShape(pres.ShapeType.roundRect, { x, y, w, h, fill: { color: dark ? "22346F" : C.ntint }, line: { color: dark ? "22346F" : C.ntint }, rectRadius: 0.08 });
    s.addText(big, { x: x + 0.15, y: y + 0.12, w: w - 0.3, h: 0.6, fontFace: HF, fontSize: 26, bold: true, color: dark ? C.white : C.teal, isTextBox: true, margin: 0 });
    s.addText(label, { x: x + 0.15, y: y + 0.7, w: w - 0.3, h: h - 0.78, fontFace: BF, fontSize: 10, color: dark ? "C9D4EE" : C.muted, isTextBox: true, margin: 0, valign: "top" });
  };
  const card = (s, x, y, w, h, iconName, head, body, fill = C.panel) => {
    s.addShape(pres.ShapeType.roundRect, { x, y, w, h, fill: { color: fill }, line: { color: fill }, rectRadius: 0.08 });
    s.addShape(pres.ShapeType.ellipse, { x: x + 0.2, y: y + 0.2, w: 0.42, h: 0.42, fill: { color: C.white }, line: { color: C.white } });
    s.addImage({ data: ic[iconName], x: x + 0.29, y: y + 0.29, w: 0.24, h: 0.24 });
    s.addText(head, { x: x + 0.2, y: y + 0.7, w: w - 0.4, h: 0.3, fontFace: HF, fontSize: 12, bold: true, color: C.navy, isTextBox: true, margin: 0 });
    s.addText(body, { x: x + 0.2, y: y + 1.02, w: w - 0.4, h: h - 1.12, fontFace: BF, fontSize: 10.5, color: C.ink, isTextBox: true, margin: 0, valign: "top" });
  };
  const box = (s, x, y, w, h, head, lines, fill, headColor = C.white, bodyColor = "C9D4EE") => {
    s.addShape(pres.ShapeType.roundRect, { x, y, w, h, fill: { color: fill }, line: { color: fill }, rectRadius: 0.1 });
    s.addText(head, { x: x + 0.2, y: y + 0.15, w: w - 0.4, h: 0.35, fontFace: HF, fontSize: 13, bold: true, color: headColor, isTextBox: true, margin: 0 });
    bullets(s, lines, { x: x + 0.2, y: y + 0.55, w: w - 0.4, h: h - 0.65, size: 10.5, color: bodyColor });
  };
  const arrow = (s, x, y, w) => s.addShape(pres.ShapeType.rightArrow, { x, y, w, h: 0.3, fill: { color: C.teal }, line: { color: C.teal } });

  // 1. Title
  { const s = pres.addSlide(); s.background = { color: C.navy };
    s.addShape(pres.ShapeType.roundRect, { x: 0.5, y: 0.45, w: 2.5, h: 1.05, fill: { color: C.white }, line: { color: C.white }, rectRadius: 0.1 });
    s.addImage({ data: "image/png;base64:".replace(":", ",") + logo, x: 0.65, y: 0.53, w: 2.2, h: 0.9 });
    s.addText("Ayni Mesh", { x: 0.5, y: 1.75, w: 8.5, h: 0.7, fontFace: HF, fontSize: 40, bold: true, color: C.white, isTextBox: true, margin: 0 });
    s.addText("Frontier open models on hardware you already own.", { x: 0.5, y: 2.45, w: 8.8, h: 0.6, fontFace: HF, fontSize: 24, bold: true, color: C.tealB, isTextBox: true, margin: 0, valign: "top" });
    s.addText("The judgment stage of the Ayni marketplace: a swarm of community desktops serving 7B to 700B open models as one model, metered, verified and paid.", { x: 0.5, y: 3.2, w: 7.8, h: 0.9, fontFace: BF, fontSize: 15, color: "C9D4EE", isTextBox: true, margin: 0, valign: "top" });
    s.addText("Built on Colibrì and Lumabri (Apache 2.0) · Ayni 1.0 keeps running unchanged", { x: 0.5, y: 4.4, w: 8.5, h: 0.3, fontFace: BF, fontSize: 11, color: C.tealB, isTextBox: true, margin: 0 });
    s.addText("Zalesgen LLC · September 2026 · Confidential", { x: 0.5, y: 5.15, w: 6, h: 0.3, fontFace: BF, fontSize: 9, color: "9DB0D3", isTextBox: true, margin: 0 });
    s.addNotes("Mesh is the second product line, not a replacement. 1.0 is phones and laptops running small models for mechanical work. Mesh is desktops and laptops with SSDs running large open models for judgment work. The question this deck answers: is there real value, and where does it sell first.");
  }

  // 2. The lesson from 1.0
  { const s = pres.addSlide(); kicker(s, "Why Mesh exists"); title(s, "1.0 taught us where the value stops.");
    s.addText("Ayni 1.0 runs a 0.5B model on phones and laptops. It is cheap, sealed per device, and the supply is enormous. It does mechanical work well and judgment work not at all.", { x: 0.5, y: 1.1, w: 9, h: 0.7, fontFace: BF, fontSize: 13, color: C.ink, isTextBox: true, margin: 0, valign: "top" });
    stat(s, 0.5, 1.95, 2.1, "$0.027", "per 1M tokens for a 226-token log line on the 0.5B class; 3 to 5x under the nano tier", false, 1.4);
    stat(s, 2.8, 1.95, 2.1, "2 of 5", "distinct answers the 0.5B model gave across 12 labelled security lines: not a classifier", false, 1.4);
    stat(s, 5.1, 1.95, 2.1, "0", "devices in the 7B to 700B classes online today; the rate card prices them, nobody serves them", false, 1.4);
    stat(s, 7.4, 1.95, 2.1, "2 stages", "phones normalize and label millions of items; something else must judge the flagged subset", false, 1.4);
    card(s, 0.5, 3.55, 4.35, 1.45, "FiSmartphone", "What phones sell", "Extraction, closed-set labelling, embeddings, redundancy votes. Mechanical, short, constrained, enormous. Keep it as it is.");
    card(s, 5.15, 3.55, 4.35, 1.45, "FiAlertTriangle", "What nobody sells yet", "\"Is this an incident?\" needs a model that reasons. Hosted APIs sell it with their retention policy attached. Ayni has no supply for it.", C.tint);
    foot(s);
    s.addNotes("The measured facts from the 1.0 pilots: the mechanical stage is priced competitively and works; the judgment stage has no supply. Mesh is built to supply exactly that stage.");
  }

  // 3. What changed
  { const s = pres.addSlide(); kicker(s, "What changed"); title(s, "Two open projects moved the wall.");
    box(s, 0.5, 1.15, 4.35, 3.85, "Colibrì  ·  the engine", [
      "Pure C, no dependencies. Nine frontier MoE families, one command line: GLM-5.3 (744B), DeepSeek V4 Flash (284B), Kimi K3 (2.8T), Qwen3.6 (35B), OLMoE (7B).",
      "Treats VRAM, RAM and SSD as one memory hierarchy; streams only the experts a token routes to.",
      "GLM-5.3-Flash (321B) on a 25 GB desktop. 1.8 tok/s on a 128 GB CPU box; 6.8 tok/s on six RTX 5090s.",
      "Placement may change speed, never semantics: outputs validated token-exact.",
      "30,000 stars, daily commits, Apache 2.0.",
    ], C.navy);
    box(s, 5.15, 1.15, 4.35, 3.85, "Lumabri  ·  the swarm", [
      "Same author. Runs one model as a chain of layer segments or expert peers over a tracker.",
      "Signed weights, Ed25519 identities, ChaCha20-Poly1305 transport, NAT relay through the donor's own outbound tunnel: nothing to configure at home.",
      "Leases, fencing, snapshot and restore: a chat survives losing a peer. N% of calls re-executed on another peer and compared byte for byte.",
      "Measured: the network changed 0 of 24 tokens; 6 tok/s on a LAN, 1.1 tok/s at 30 ms internet RTT.",
      "No economics, no attestation, no phones, no Windows yet.",
    ], C.teal);
    foot(s);
    s.addNotes("The technical claim to remember: a household desktop with a fast SSD is now a credible server for a 300B-class open model, and a swarm of them is one model. That did not exist a year ago.");
  }

  // 4. Ayni Mesh = engine + swarm + marketplace
  { const s = pres.addSlide(); kicker(s, "The product"); title(s, "Mesh adds the layer the swarm is missing.");
    const cols = [
      { x: 0.5, head: "Engine (Colibrì)", fill: C.panel, icon: "FiCpu", lines: ["Model math, formats, kernels", "CPU, Metal, CUDA, Vulkan tiers", "Pinned upstream, not forked"] },
      { x: 3.55, head: "Swarm (Lumabri)", fill: C.panel, icon: "FiGitBranch", lines: ["Discovery, NAT relay, leases", "Segments and expert peers", "Verification, failover, snapshots"] },
      { x: 6.6, head: "Marketplace (Ayni)", fill: C.tint, icon: "FiDollarSign", lines: ["Who may be a peer: attestation tiers", "What it costs: quotes, metered earnings per peer", "What runs where: price, RTT, benchmark", "Council on shape, never content"] },
    ];
    for (const c of cols) {
      s.addShape(pres.ShapeType.roundRect, { x: c.x, y: 1.2, w: 2.9, h: 2.5, fill: { color: c.fill }, line: { color: c.fill }, rectRadius: 0.1 });
      s.addShape(pres.ShapeType.ellipse, { x: c.x + 0.2, y: 1.4, w: 0.42, h: 0.42, fill: { color: C.white }, line: { color: C.white } });
      s.addImage({ data: ic[c.icon], x: c.x + 0.29, y: 1.49, w: 0.24, h: 0.24 });
      s.addText(c.head, { x: c.x + 0.75, y: 1.42, w: 2.1, h: 0.4, fontFace: HF, fontSize: 13, bold: true, color: C.navy, isTextBox: true, margin: 0, valign: "middle" });
      bullets(s, c.lines, { x: c.x + 0.2, y: 2.0, w: 2.55, h: 1.6, size: 11 });
    }
    s.addShape(pres.ShapeType.roundRect, { x: 0.5, y: 3.95, w: 9, h: 1.05, fill: { color: C.navy }, line: { color: C.navy }, rectRadius: 0.1 });
    s.addText([
      { text: "Same buyer surface as 1.0. ", options: { bold: true, color: C.tealB } },
      { text: "Quote, accept, run, collect: the API, the Python client and the MCP server do not change. A Mesh route is one more provider class in the scheduler, priced per million tokens like everything else.", options: { color: C.white } },
    ], { x: 0.75, y: 4.1, w: 8.5, h: 0.8, fontFace: BF, fontSize: 12.5, isTextBox: true, margin: 0, valign: "middle" });
    foot(s);
    s.addNotes("Nothing is forked. The engine and swarm are pinned dependencies; Ayni writes an adapter. The buyer never sees Lumabri: a Mesh route is a provider class behind the same quote and accept API the MCP server already uses.");
  }

  // 5. Two-stage pipeline
  { const s = pres.addSlide(); kicker(s, "How it composes"); title(s, "Phones do the million, Mesh does the thousand.", { size: 26 });
    const steps = [
      { icon: "FiServer", head: "1,000,000 events", body: "A day of Workspace, syslog or CloudTrail from the customer's export." },
      { icon: "FiSmartphone", head: "Phones: normalize", body: "0.5B class extracts actor, action, target, source into one schema. About $6 per million events." },
      { icon: "FiLayers", head: "Rules: flag", body: "Deterministic severity rules keep 2% for review. Free, auditable, never wrong the way a model is." },
      { icon: "FiCpu", head: "Mesh: judge", body: "20,000 flagged events go to a 300B-class open model on the swarm. \"Incident or not, and why.\"" },
      { icon: "FiCheckCircle", head: "Verified findings", body: "Answers voted across peers, cost and serving devices on every finding, into the SIEM." },
    ];
    const w = 1.66, gap = 0.17;
    steps.forEach((st, i) => {
      const x = 0.5 + i * (w + gap);
      s.addShape(pres.ShapeType.roundRect, { x, y: 1.25, w, h: 2.6, fill: { color: i === 3 ? C.tint : C.panel }, line: { color: i === 3 ? C.tint : C.panel }, rectRadius: 0.08 });
      s.addShape(pres.ShapeType.ellipse, { x: x + 0.2, y: 1.45, w: 0.42, h: 0.42, fill: { color: C.white }, line: { color: C.white } });
      s.addImage({ data: ic[st.icon], x: x + 0.29, y: 1.54, w: 0.24, h: 0.24 });
      s.addText(st.head, { x: x + 0.15, y: 1.95, w: w - 0.3, h: 0.5, fontFace: HF, fontSize: 11.5, bold: true, color: C.navy, isTextBox: true, margin: 0, valign: "top" });
      s.addText(st.body, { x: x + 0.15, y: 2.45, w: w - 0.3, h: 1.35, fontFace: BF, fontSize: 10, color: C.ink, isTextBox: true, margin: 0, valign: "top" });
      if (i < steps.length - 1) arrow(s, x + w - 0.02, 2.4, 0.2);
    });
    stat(s, 0.5, 4.05, 2.9, "98%", "of the volume never touches a large model; it is priced at the phone rate", false, 1.0);
    stat(s, 3.55, 4.05, 2.9, "2%", "reaches the judgment class, where price per correct answer is the metric", false, 1.0);
    stat(s, 6.6, 4.05, 2.9, "1 API", "one quote for both stages; MCP tools unchanged; per million tokens", false, 1.0);
    foot(s);
    s.addNotes("This is the answer to 'does Mesh complement the 0.5B'. Yes: it is the second stage of the same pipeline. The phones' job is to make the expensive stage small.");
  }

  // 6. Measured
  { const s = pres.addSlide(); kicker(s, "Evidence"); title(s, "Measured this week, not promised.");
    const h = (t) => ({ text: t, options: { bold: true, color: C.white, fill: { color: C.navy } } });
    const rows = [
      [h("Test"), h("Where"), h("Result")],
      ["Expert-peer swarm, tiny fixture, 4 peers", "GCP e2-standard-8, loopback", "1,984 remote expert calls, 8.4 ms per layer round, tokens identical to the local engine, incompatible build refused, spot-check verification agreed"],
      ["Two-peer layer chain, real OLMoE-1B-7B", "GCP, 8 CPU cores, no GPU", "decode 12 to 13 tok/s, prefill 4 to 5.5 s, 3.8 MB on the wire for 48 tokens, generated ids identical to local Colibrì"],
      ["WAN chain, real OLMoE, 87 ms round trip", "peers on GCP, chatter on a 16 GB Mac; then Mac as relay-only peer behind home NAT", "3.5 to 4.6 tok/s, about one round trip per hop per token; faster than the Mac running the model alone (1.6 to 2.6 tok/s)"],
      ["Model conversion", "GCP", "OLMoE 13.8 GB checkpoint to a 7 GB int8 container in 3.5 minutes, shard by shard"],
      ["Two-region chain, real OLMoE, us-east1 to europe-west1, 107 ms RTT", "GCP, two VMs", "decode 4.1 to 4.7 tok/s (one WAN hop per token), prefill 9 s; symmetric from either side; tracker refuses unreachable peers"],
      ["Lumabri's own release gate", "author's runs", "network changed 0 of 24 tokens; LAN 6.0 tok/s vs internet 1.1 tok/s vs slow-disk local 0.04 tok/s"],
    ];
    s.addTable(rows, { x: 0.5, y: 1.15, w: 9, colW: [2.6, 2.0, 4.4], fontFace: BF, fontSize: 10, color: C.ink, border: { type: "solid", color: C.line, pt: 0.75 }, rowH: [0.35, 0.62, 0.62, 0.62, 0.5, 0.62], valign: "middle", fill: { color: C.white } });
    s.addText("The engine and swarm are correct, and a laptop renting two peers across the internet beat itself. The remaining gap to same-host speed (12 tok/s) is the price of the WAN; batching amortises it, and that is the next measurement.", { x: 0.5, y: 4.55, w: 9, h: 0.5, fontFace: BF, fontSize: 11.5, italic: true, color: C.muted, isTextBox: true, margin: 0, valign: "top" });
    foot(s);
    s.addNotes("Every number here came from a run we executed or from Lumabri's published gate. The next number we need is a real WAN run: tracker on GCP, one peer on GCP, one peer behind a home NAT.");
  }

  // 7. What Mesh sells
  { const s = pres.addSlide(); kicker(s, "Value"); title(s, "What Mesh sells, and what it does not.");
    card(s, 0.5, 1.15, 2.9, 1.85, "FiHome", "Sovereignty", "Any open model on hardware you own or a community you choose. Pick peers by country. Nothing leaves the machines you selected.");
    card(s, 3.55, 1.15, 2.9, 1.85, "FiGlobe", "Model choice", "Every open checkpoint Colibrì runs, the day it is released, unfiltered and unchanged. No vendor deprecates your model.");
    card(s, 6.6, 1.15, 2.9, 1.85, "FiShield", "Verified answers", "Replica re-execution and majority votes across peers, attested tiers, Council on shape. A finding carries who served it and what it cost.");
    card(s, 0.5, 3.15, 4.35, 1.85, "FiDollarSign", "Batch price on idle hardware", "Marginal cost of an idle desktop is near zero. For overnight judgment work, price per correct answer competes with hosted 70B, once batching is proven. We publish the measurement, not the hope.", C.tint);
    s.addShape(pres.ShapeType.roundRect, { x: 5.15, y: 3.15, w: 4.35, h: 1.85, fill: { color: C.navy }, line: { color: C.navy }, rectRadius: 0.08 });
    s.addText("Not for sale", { x: 5.35, y: 3.3, w: 4, h: 0.3, fontFace: HF, fontSize: 12, bold: true, color: C.tealB, isTextBox: true, margin: 0 });
    bullets(s, ["Sub-second interactive chat across the internet. Sequential layers pay a round trip each.", "Cheaper tokens than an H100 for models that fit an H100. Small models belong on phones and GPUs.", "Prompt secrecy at the community tier. Peers see activations; use attested or private pools."], { x: 5.35, y: 3.65, w: 4.0, h: 1.3, size: 10.5, color: C.white });
    foot(s);
    s.addNotes("Be precise about the claim. Mesh is sovereignty, choice and verification for batch judgment. It is not a cheaper frontier API and not a chat product.");
  }

  // 8. Go-to-market wedges
  { const s = pres.addSlide(); kicker(s, "Go to market"); title(s, "Three wedges, in this order.");
    const wedges = [
      { head: "1 · Private Mesh", sub: "Bring your own desktops", fill: C.navy, lines: ["A team's 5 to 50 machines become one 300B-class model overnight, with Ayni's scheduler, metering, attestation and audit.", "Sold as software plus coordination: per seat or per machine per month, plus metered tokens.", "No supply to bootstrap; the customer owns the hardware. The LAN-router crowd (NVIDIA PAIR users) is the first list."] },
      { head: "2 · Community Mesh", sub: "The public swarm", fill: C.teal, lines: ["Desktop and gaming-PC owners with NVMe join as peers and earn per segment or expert call.", "Buyers quote per million tokens by class, choose tier and country, get verified answers.", "Opens when three-donor swarms beat one machine by 2x on the release gate."] },
      { head: "3 · Overflow", sub: "Private first, community when full", fill: C.panel, dark: false, lines: ["A private mesh spills its queue to the community swarm at a quoted price when its own machines are saturated.", "The same route on both sides; the buyer sets the boundary with a trust tier.", "This is the 1.0 hybrid marketplace story, now with a judgment class to sell."] },
    ];
    wedges.forEach((w, i) => {
      const x = 0.5 + i * 3.05, dark = w.fill !== C.panel;
      s.addShape(pres.ShapeType.roundRect, { x, y: 1.15, w: 2.9, h: 3.85, fill: { color: w.fill }, line: { color: w.fill }, rectRadius: 0.1 });
      s.addText(w.head, { x: x + 0.2, y: 1.3, w: 2.5, h: 0.35, fontFace: HF, fontSize: 14, bold: true, color: dark ? C.white : C.navy, isTextBox: true, margin: 0 });
      s.addText(w.sub, { x: x + 0.2, y: 1.65, w: 2.5, h: 0.3, fontFace: BF, fontSize: 11, italic: true, color: w.fill === C.teal ? "E4EAF7" : (dark ? C.tealB : C.teal), isTextBox: true, margin: 0 });
      bullets(s, w.lines, { x: x + 0.2, y: 2.05, w: 2.5, h: 2.85, size: 10.5, color: dark ? "E4EAF7" : C.ink });
    });
    foot(s);
    s.addNotes("Private Mesh first because it needs no marketplace liquidity and the buyer already owns the machines. It also answers the CISO's 'nothing leaves the building'. Community Mesh follows once the release gate proves swarms beat single machines.");
  }

  // 9. Who buys, who supplies
  { const s = pres.addSlide(); kicker(s, "Customers and supply"); title(s, "Who buys first, and who lends the machines.");
    const h = (t) => ({ text: t, options: { bold: true, color: C.white, fill: { color: C.navy } } });
    s.addTable([
      [h("Buyer"), h("Workload"), h("Why Mesh")],
      ["Security teams and MSSPs", "Nightly judgment on flagged events; incident write-ups", "Data stays on chosen machines; verified findings; open models they can audit"],
      ["Regulated SMBs, EU and LatAm", "Document review, contract triage, compliance checks", "Residency by peer selection; no US-hosted API in the loop"],
      ["Data-ops and labelling shops", "Silver labels, quality checks on the phone stage's output", "Batch price on idle hardware; redundancy votes as QA"],
      ["Research groups", "Evaluation sweeps on open frontier models", "Any checkpoint, no rate limits, pay per token to a commons"],
    ], { x: 0.5, y: 1.15, w: 9, colW: [2.2, 3.2, 3.6], fontFace: BF, fontSize: 10, color: C.ink, border: { type: "solid", color: C.line, pt: 0.75 }, rowH: [0.3, 0.42, 0.42, 0.42, 0.42], valign: "middle", fill: { color: C.white } });
    card(s, 0.5, 3.35, 4.35, 1.6, "FiUsers", "Supply: desktops, not phones", "Gaming PCs and workstations with 32 GB+ RAM and an NVMe drive; small teams' LAN clusters as one peer; laptops overnight. Linux and macOS now; Windows is the gap to close.");
    card(s, 5.15, 3.35, 4.35, 1.6, "FiTrendingUp", "Earnings that mean something", "A desktop serving a 300B-class segment earns at the LARGE rate, not the phone rate. Overnight donation pays for the electricity and then some; we publish the measured number.", C.tint);
    foot(s);
    s.addNotes("Supply for Mesh is a different population from 1.0: fewer, larger machines with disks. Windows support is the single biggest supply unlock and it is not certified upstream yet.");
  }

  // 10. Economics
  { const s = pres.addSlide(); kicker(s, "Economics"); title(s, "Per million tokens, with the cost floor shown.");
    s.addChart(pres.ChartType.bar, [{ name: "USD per 1M tokens, blended", labels: ["Electricity floor, batched 16x", "Electricity floor, 1 desktop, 2 tok/s", "Ayni XL card (70B+/MoE)", "Ayni LARGE card (30-70B)", "Hosted open 70B", "Frontier closed APIs"], values: [0.4, 6.0, 2.25, 1.0, 0.75, 6.0] }],
      { x: 0.5, y: 1.1, w: 5.4, h: 3.7, barDir: "bar", chartColors: [C.teal], showTitle: true, title: "Approximate list prices and cost floors, USD per 1M tokens", titleFontFace: HF, titleFontSize: 10, titleColor: C.navy, showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "$0.00", dataLabelFontSize: 9, dataLabelColor: C.ink, catAxisLabelFontSize: 9, catAxisLabelColor: C.ink, valAxisLabelFontSize: 8, valAxisLabelColor: C.muted, valGridLine: { color: C.line, size: 0.5 }, catGridLine: { style: "none" }, showLegend: false });
    bullets(s, [
      "Every Mesh price is per million tokens by class, like 1.0 and like every vendor. The LARGE and XL cards already exist.",
      "The floor is electricity, not hardware: a 200 W desktop at 2 tok/s burns about $6 of power per million tokens. Batching sixteen sequences through the same expert loads is what brings it under $0.50. Colibrì's batched expert unions and Lumabri's 8-client gate measure exactly this.",
      "So the honest position: for single-stream frontier tokens Mesh is not cheaper than a data center. For batched, overnight judgment on open models it can be, and we will publish the run before we sell it.",
      "Provider share 70%, attested 1.4x, confidential 3x, spot 60%: unchanged from 1.0.",
    ], { x: 6.1, y: 1.15, w: 3.4, h: 3.7, size: 10 });
    foot(s);
    s.addNotes("This slide is deliberately unflattering. The frontier closed number is a blended list price; hosted open 70B is the competitor to beat; the electricity floor is arithmetic. Batching is the lever, and it is measurable with tools that already exist upstream.");
  }

  // 11. Risks
  { const s = pres.addSlide(); kicker(s, "Risks"); title(s, "What can go wrong, and what we do about it.");
    const h = (t) => ({ text: t, options: { bold: true, color: C.white, fill: { color: C.navy } } });
    s.addTable([
      [h("Risk"), h("What it means"), h("Mitigation")],
      ["Latency", "Sequential layers pay a round trip each; internet RTT cut throughput 6x in Lumabri's gate", "Batch only; place peers by RTT; batch-union and speculative drafts; Private Mesh on a LAN first"],
      ["Activation privacy", "Segment peers see hidden states, expert peers see expert inputs; not the prompt, but a leak", "Attested tiers, private pools, customer-chosen countries; say it plainly in every doc"],
      ["Verification cost", "Replica re-execution is the only check today", "Price the buffer; proof-of-inference on the research track"],
      ["Windows and phones", "Most idle desktops run Windows; no phone path in Colibrì", "Fund upstream Windows certification; phones stay in 1.0"],
      ["Upstream dependency", "Two fast-moving codebases we do not own", "Pin commits, adapter layer, contribute back, never fork the engine"],
      ["Supply bootstrapping", "A swarm with no peers is a tracker", "Private Mesh needs none; community opens on the release gate"],
    ], { x: 0.5, y: 1.15, w: 9, colW: [1.7, 3.7, 3.6], fontFace: BF, fontSize: 9.5, color: C.ink, border: { type: "solid", color: C.line, pt: 0.75 }, rowH: [0.32, 0.55, 0.55, 0.45, 0.45, 0.45, 0.45], valign: "middle", fill: { color: C.white } });
    foot(s);
    s.addNotes("The two risks that decide the business are latency and Windows. Latency is why the product is batch and private-first; Windows is why supply grows slowly until upstream certifies it.");
  }

  // 12. Roadmap
  { const s = pres.addSlide(); kicker(s, "Roadmap"); title(s, "Five milestones, each ends with a number.");
    const ms = [
      { head: "M1 · WAN proof", when: "Sep 2026", body: "Tracker on GCP, one peer on GCP, one peer behind a home NAT. Real model. tok/s, per-hop RTT, snapshot on peer loss." },
      { head: "M2 · Ayni adapter", when: "Oct", body: "A Mesh route is a provider class: quote, accept, run, collect unchanged. Metered earnings per peer. MCP tools work as is." },
      { head: "M3 · Pilot judgment stage", when: "Oct", body: "The CISO pilot's flagged 2% judged on the swarm. Price per correct answer next to hosted 70B, measured on labelled lines." },
      { head: "M4 · Private Mesh installer", when: "Nov", body: "One installer for a team's machines, Windows included, with attestation, metering and audit. First paying private mesh." },
      { head: "M5 · Community swarm", when: "Q1 2027", body: "Opens when three donors beat one machine by 2x on the release gate. GPU peers, proof-of-inference spike." },
    ];
    ms.forEach((m, i) => {
      const x = 0.5 + i * 1.83;
      s.addShape(pres.ShapeType.ellipse, { x: x + 0.62, y: 1.25, w: 0.5, h: 0.5, fill: { color: i < 2 ? C.teal : C.navy }, line: { color: C.white, width: 1 } });
      s.addText(String(i + 1), { x: x + 0.62, y: 1.25, w: 0.5, h: 0.5, fontFace: HF, fontSize: 14, bold: true, color: C.white, align: "center", valign: "middle", isTextBox: true, margin: 0 });
      if (i < ms.length - 1) s.addShape(pres.ShapeType.line, { x: x + 1.12, y: 1.5, w: 0.71, h: 0, line: { color: C.line, width: 2 } });
      s.addText(m.head, { x, y: 1.9, w: 1.73, h: 0.45, fontFace: HF, fontSize: 11, bold: true, color: C.navy, isTextBox: true, margin: 0, valign: "top" });
      s.addText(m.when, { x, y: 2.35, w: 1.73, h: 0.25, fontFace: BF, fontSize: 10, italic: true, color: C.teal, isTextBox: true, margin: 0 });
      s.addText(m.body, { x, y: 2.65, w: 1.73, h: 1.7, fontFace: BF, fontSize: 9.5, color: C.ink, isTextBox: true, margin: 0, valign: "top" });
    });
    s.addShape(pres.ShapeType.roundRect, { x: 0.5, y: 4.4, w: 9, h: 0.6, fill: { color: C.tint }, line: { color: C.tint }, rectRadius: 0.08 });
    s.addText("Kill criteria, stated now: if M1 shows under 1 tok/s across a real WAN with batching, or M3 cannot beat hosted 70B on price per correct answer, Mesh stays a Private Mesh product and the community swarm waits for GPU peers.", { x: 0.7, y: 4.45, w: 8.6, h: 0.5, fontFace: BF, fontSize: 10.5, color: C.ink, isTextBox: true, margin: 0, valign: "middle" });
    foot(s);
    s.addNotes("Milestones end with numbers, and the kill criteria are written before the runs. That is the same discipline the upstream projects use, and the reason their numbers are believable.");
  }

  // 13. Ask
  { const s = pres.addSlide(); s.background = { color: C.navy };
    kicker(s, "The ask", C.tealB);
    title(s, "What Mesh needs in the next 90 days.", { color: C.white });
    stat(s, 0.5, 1.3, 2.9, "10", "peer machines with 32 GB+ RAM and NVMe, on loan from the community, for M1 and M5", true, 1.4);
    stat(s, 3.55, 1.3, 2.9, "2", "pilot customers with a batch judgment workload and labelled data: one security team, one regulated SMB", true, 1.4);
    stat(s, 6.6, 1.3, 2.9, "1", "decision: fund upstream Windows certification, or accept Linux and macOS supply for a year", true, 1.4);
    bullets(s, [
      "Ayni 1.0 keeps shipping: phones, the MCP server, the CISO pilot's mechanical stage. Mesh is a second track with its own repo and GCP project, so neither slows the other.",
      "Everything Mesh publishes is measured: throughput, price per correct answer, what peers can see. The upstream projects earned 30,000 stars that way; we will earn customers the same way.",
    ], { x: 0.5, y: 3.0, w: 9, h: 1.7, size: 12.5, color: "E4EAF7" });
    s.addText("github.com/Ayni-ai/mesh  ·  ayni-ai.com  ·  hello@ayni-ai.com", { x: 0.5, y: 4.75, w: 8.5, h: 0.3, fontFace: BF, fontSize: 11, color: C.tealB, isTextBox: true, margin: 0 });
    foot(s, true);
    s.addNotes("Close on the three concrete asks and the one decision. The Windows question is the one that shapes supply for a year.");
  }

  await pres.writeFile({ fileName: OUT });
  console.log("wrote", OUT);
})();
