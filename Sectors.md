# NEVA NETWORK — SECTOR BOOK

A catalog of every named region of the Spatial Memory Graph. Each sector records
its coordinates, composition, and rules. Append a new `## Sector XX` block when a
new region is authored. (See `NEVA_NETWORK_MASTER_BLUEPRINT.md` for the system.)

---

## Sector A01

**The origin sector — the current Depth 01 Spatial Memory Graph** (the network you
spawn into). Deterministic: a fixed `WORLD_SEED` always reproduces it exactly.

### Identity
- **ID:** A01
- **Label:** SECTOR A01
- **Depth:** 01 (baseline layer)
- **Security level:** LOW (safe starter region)
- **Seed:** `WORLD_SEED = 0x5EED1D` (network sub-seed `^0x4E70A17`, types `^0x6A3E11`)

### Coordinates
- **Shape:** spherical cloud centered on the origin.
- **Field radius:** 130 units (`FIELD.radius`).
- **Bounds (min → max):** `(-130, -130, -130) → (130, 130, 130)`.
- **Cluster span:** lobe centres within radius ≈ 91 (`R · 0.7`); nodes scattered ±18–34 around them.
- **Camera spawn:** `(34, 26, 188)` looking at `(0, 0, 0)` (just outside the cloud, looking in).
- **Live grid address:** the Coordinate Ruler shows a per-position hex sector
  `XX-YY-ZZ` = `floor(coord/8) & 0xFF` per axis (e.g. `04-03-17`); A01 is the
  whole field these addresses live inside.

### Composition
- **Interactive nodes (Node Frames):** 220 (`INTERACTIVE_COUNT`).
- **Clusters / lobes:** 11 (`CLUSTER_COUNT`).
- **Links:** nearest-neighbour, ≤ 3 per node (`MAX_NEIGHBOURS`), within 30 units (`LINK_DISTANCE`).
- **Background Micro Nodes:** 12,000 atmosphere points (MEDIUM quality; LOW 5k / HIGH 20k).

### Node-type distribution (weighted, deterministic)
| Type | Weight | Risk | Base value | Notes |
|------|-------:|------|-----------:|-------|
| MEMORY | 22 | LOW | 10 | safe export |
| CAMERA | 14 | MED | 6 | high trace on OPEN STREAM |
| MESSAGE | 14 | LOW | 8 | trace reveals nearby links |
| ARCHIVE | 12 | MED | 15 | trace before export |
| IDENTITY | 10 | HIGH | 20 | high value / high trace |
| GATEWAY | 8 | HIGH | — | OPEN STREAM → ENTER SUBNETWORK → Depth 02 |
| DECOY | 20 | CRIT | — | export = trace spike (denser hazard field) |
| LOCKED | 10 | HIGH | 12 | needs unlock or Access ≥ 2 |

### Rules in A01 (Depth 01 baseline)
- **Trace:** baseline gains (no depth multiplier at Depth 01); decays ~1.4 %/s when idle; lock at 100 %.
- **Access:** starts LV 1; `+1 per 100 extracted data`. LOCKED needs LV 2; ARCHIVE needs a TRACE or LV 2.
- **Export values:** base (Depth-01 multiplier ×1.0).
- **Gateways:** several present (~8 % of nodes) — the route to Depth 02 subnetworks.

### Status
Origin sector, fully playable. Deeper sectors (Depth 02+) are spawned from A01's
GATEWAY nodes and will be catalogued here as they are authored (A02, A03, …).
