# SCIENCE-CODEX.md — puzzle source material

The fuel for `docs/PUZZLE-DESIGN.md`. Each section gives **the facts/formulas** plus
**puzzle hooks** (how to turn them into NEVA NETWORK puzzles). Section anchors match the
references in the puzzle-design doc (§Number theory, §Mechanics, etc.).

> Use these as starting points — every formula here can be parameterized by a seeded RNG
> to mint endless variants. Keep values inside ranges where the math stays clean for the
> tier you're targeting.

---

# MATHEMATICS

## §Number theory
- **Primes**: 2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101…
  Every integer >1 has a unique prime factorization (fundamental theorem of arithmetic).
- **Divisibility tests**: by 3 → digit sum divisible by 3; by 9 → digit sum by 9; by 11 →
  alternating digit sum; by 7 → double the last digit, subtract from the rest, repeat.
- **GCD via Euclid**: gcd(a,b)=gcd(b, a mod b) until b=0. **LCM** = a·b/gcd(a,b).
- **Modular arithmetic**: clock math mod n. `(a+b) mod n`, `(a·b) mod n`. Fermat's little
  theorem: if p prime and gcd(a,p)=1 then a^(p−1) ≡ 1 (mod p).
- **Special numbers**: perfect (6, 28, 496, 8128 — equal sum of proper divisors), triangular
  (1,3,6,10,15 = n(n+1)/2), square, pentagonal, factorials (1,2,6,24,120,720…).
- **Checksums**: digit-sum/Luhn/parity — basis for "spot the corrupted node."
- *Puzzle hooks:* classify prime vs composite (archetype 11); "next perfect/triangular
  number" (2); modular cipher key (1); corrupted-checksum decoy (5); GCD as a door code.

## §Sequences
- **Arithmetic**: aₙ = a₁ + (n−1)d. Sum = n(a₁+aₙ)/2.
- **Geometric**: aₙ = a₁·r^(n−1). Sum = a₁(rⁿ−1)/(r−1); infinite (|r|<1) = a₁/(1−r).
- **Fibonacci**: 1,1,2,3,5,8,13,21,34,55… Fₙ=Fₙ₋₁+Fₙ₋₂; ratio → φ=(1+√5)/2≈1.618 (golden).
- **Other classics**: squares (1,4,9,16), cubes (1,8,27,64), powers of 2 (1,2,4,8,16,32…),
  Catalan (1,1,2,5,14,42), look-and-say (1,11,21,1211,111221), primes.
- *Puzzle hooks:* "term n+1" (2); "find the rule then term 20" (2); mix two sequences and
  ask which index breaks the pattern (5).

## §Geometry
- **Pythagoras**: a²+b²=c². Common triples: (3,4,5),(5,12,13),(8,15,17),(7,24,25).
- **Circle**: C=2πr, A=πr². **Sphere**: V=4/3·πr³, surface=4πr². **Triangle**: A=½·b·h;
  Heron's A=√(s(s−a)(s−b)(s−c)), s=(a+b+c)/2. Angles sum 180°; polygon interior sum=(n−2)·180°.
- **Trig**: sin/cos/tan; sin²+cos²=1; law of cosines c²=a²+b²−2ab·cosC; law of sines
  a/sinA=b/sinB. Radians: 180°=π. Unit circle key angles (0,30,45,60,90°).
- **Transforms**: rotation by θ → (x cosθ−y sinθ, x sinθ+y cosθ); reflection, translation,
  scaling. Determinant of a 2×2 = signed area scale.
- *Puzzle hooks:* compute area/length (6); rotate/reflect a shape and match the result (8);
  "which triple is NOT right-angled" decoy (5).

## §Graph theory  ← maps directly onto `NETWORK`
- A graph = nodes + edges. The project's `NETWORK.neighbours` / `NETWORK.edges` are exactly this.
- **Degree** = number of links (already stored as `links`). Handshake lemma: Σdegrees = 2·edges.
- **Paths**: BFS finds shortest path by hop count; **Dijkstra** for weighted (use trace cost
  as weight). **Connected components** = the lobes/clusters.
- **Trees**: connected, acyclic, n nodes → n−1 edges. **Minimum spanning tree** (Prim/Kruskal).
- **Eulerian path** exists iff 0 or 2 odd-degree vertices (traverse every edge once).
  **Hamiltonian path** visits every vertex once (hard — good for high tiers).
- **Coloring**: minimum colors so no two linked nodes share one (chromatic number).
- **Centrality**: degree / betweenness / closeness — "find the most connected hub."
- *Puzzle hooks:* shortest/cheapest route between two real nodes (3); MST as "minimum trace
  to link a cluster" (3,9); find the cut node whose removal splits a cluster (ISOLATE).

## §Logic
- **Propositional**: AND ∧, OR ∨, NOT ¬, implies →, iff ↔. Truth tables. De Morgan:
  ¬(A∧B)=¬A∨¬B; ¬(A∨B)=¬A∧¬B. Contrapositive of A→B is ¬B→¬A (equivalent).
- **Knights & knaves**: knights always tell truth, knaves always lie — deduce identities
  from statements. Perfect for `IDENTITY` nodes.
- **Constraint grids** (Zebra/Einstein puzzles): a matrix of categories with clues; unique
  solution via elimination.
- **Fallacies/decoys**: affirming the consequent, circular reasoning — base for DECOY clues
  that *look* valid.
- *Puzzle hooks:* deduce which node is the GATEWAY from link statements (4); knights/knaves
  on a cluster (4); find the self-contradicting clue (5, DECOY).

## §Combinatorics & §Probability
- **Counting**: permutations P(n,k)=n!/(n−k)!; combinations C(n,k)=n!/(k!(n−k)!). nⁿ for
  sequences with repetition. Pascal's triangle = the C(n,k) values.
- **Probability**: P(A)=favorable/total; independent → multiply; mutually exclusive → add;
  P(A or B)=P(A)+P(B)−P(A and B). Expected value = Σ(value·prob). Conditional: P(A|B)=P(A∧B)/P(B).
  **Bayes**: P(A|B)=P(B|A)P(A)/P(B).
- **Knapsack** (optimization): maximize value under a weight/budget cap → maps onto
  "max extracted data under a trace budget."
- *Puzzle hooks:* "how many distinct routes" (9); expected trace of a risky EXPORT (9);
  knapsack of nodes within a trace cap (9, optimization).

## §Topology & fractals
- **Euler characteristic** for polyhedra: V − E + F = 2. (Cube: 8−12+6=2.)
- Genus (holes): a mug ≅ a donut (genus 1). Möbius strip = one side, one edge.
- **Fractals**: self-similar; Mandelbrot/Julia sets; Koch snowflake (infinite perimeter,
  finite area); Sierpinski triangle. Fractal dimension = log(pieces)/log(scale).
- *Puzzle hooks:* "is this graph planar / one connected surface" (8); count V−E+F for a
  rendered solid (6); next iteration of a fractal pattern (2).

---

# PHYSICS

## §Mechanics (classical)
- **Kinematics** (constant a): v=u+at; s=ut+½at²; v²=u²+2as.
- **Newton**: F=ma; action–reaction; **momentum** p=mv conserved in collisions;
  **impulse** = FΔt = Δp.
- **Energy**: KE=½mv²; gravitational PE=mgh (near surface) or −GMm/r (general);
  work W=F·d; power P=W/t. **Energy is conserved** (great for consistency/decoy checks).
- **Gravity**: F=G·m₁m₂/r² with G=6.674×10⁻¹¹ N·m²/kg². g_Earth≈9.81 m/s².
- **Circular/orbital**: centripetal a=v²/r; orbital v=√(GM/r); **Kepler III**: T²∝a³, i.e.
  T=2π√(a³/GM). Kepler I: orbits are ellipses (focus = central mass). Kepler II: equal areas
  in equal times. Escape velocity v=√(2GM/r) (Earth ≈ 11.2 km/s).
- **Simple harmonic**: pendulum T=2π√(L/g); spring T=2π√(m/k); F=−kx.
- *Puzzle hooks:* projectile range / time-of-flight (6); orbital period from radius (6);
  "which collision violates momentum" (5, DECOY); predict pendulum phase after t (10).

## §EM, waves & light
- **Wave**: v=f·λ; period T=1/f. Light speed c=2.998×10⁸ m/s (in vacuum).
- **EM spectrum** (long→short λ): radio > microwave > infrared > visible
  (≈700 nm red → 400 nm violet: ROYGBIV) > ultraviolet > X-ray > gamma.
- **Coulomb**: F=k·q₁q₂/r², k=8.99×10⁹. Ohm: V=IR; power P=IV=I²R. Series R adds; parallel
  1/R=Σ1/Rᵢ.
- **Photon energy**: E=hf=hc/λ, h=6.626×10⁻³⁴ J·s. Snell: n₁sinθ₁=n₂sinθ₂.
- *Puzzle hooks:* frequency↔wavelength↔energy conversions (6,7); order signals by λ (7);
  resistor-network value (6); "which color photon has more energy" (7).

## §Thermodynamics
- **Laws**: (0) thermal equilibrium is transitive; (1) ΔU=Q−W (energy conserved);
  (2) entropy of an isolated system never decreases — defines time's arrow; (3) you can't
  reach absolute zero.
- **Temperature**: K = °C + 273.15; absolute zero = 0 K = −273.15 °C. PV=nRT (ideal gas),
  R=8.314 J/(mol·K). Heat Q=mcΔT.
- **Entropy** S relates to number of microstates: S=k·ln(Ω), k=1.38×10⁻²³ J/K.
- *Puzzle hooks:* temperature-scale conversion (7); "which process decreases total entropy →
  impossible" (5, DECOY); gas-law solve-for-the-missing-variable (6).

## §Quantum
- **Quantization**: energy comes in discrete packets (photons; atomic energy levels).
  Hydrogen levels Eₙ=−13.6 eV/n².
- **Wave–particle duality**; **de Broglie** λ=h/p (matter waves).
- **Uncertainty**: Δx·Δp ≥ ħ/2 (can't know position and momentum precisely; ħ=h/2π).
- **Superposition**: a qubit is α|0⟩+β|1⟩ with |α|²+|β|²=1; measurement collapses it,
  probability |α|² of 0.
- **Entanglement**: correlated states (Bell pairs) — measuring one fixes the other.
- **Spin / Pauli exclusion**: no two fermions share all quantum numbers (builds atomic shells).
- *Puzzle hooks:* compute photon emission energy between hydrogen levels (6); "given amplitudes,
  what's P(measure 1)" (6,10); entanglement logic — deduce the partner's state (4,10);
  superposition as a node that's both DECOY and real until you "measure" (ISOLATE/EXPORT).

## §Particle physics
- **Standard Model**: 6 quarks (up, down, charm, strange, top, bottom); 6 leptons
  (electron, muon, tau + their neutrinos); force carriers (photon=EM, gluon=strong,
  W/Z=weak, Higgs=mass). Gravity (graviton) not yet in the model.
- **Composites**: proton = uud, neutron = udd. Baryons = 3 quarks; mesons = quark+antiquark.
- **Forces by strength** (strong > EM > weak > gravity) and range (EM/gravity infinite;
  strong/weak ~nuclear).
- **Conservation laws**: charge, baryon number, lepton number, energy-momentum.
- *Puzzle hooks:* classify particles into families (11); "which decay violates charge/baryon
  conservation" (5, DECOY); build a proton from quark cards (4).

---

# SPACETIME & RELATIVITY

## §Relativity (special)
- **Postulates**: laws of physics same in all inertial frames; c is constant for all observers.
- **Lorentz factor**: γ = 1/√(1−v²/c²). As v→c, γ→∞.
- **Time dilation**: moving clocks run slow — Δt = γ·Δt₀ (Δt₀ = proper time).
- **Length contraction**: L = L₀/γ (lengths shrink along motion).
- **Mass–energy**: E=mc²; total E=γmc²; rest energy = mc².
- **Velocity addition**: w = (u+v)/(1 + uv/c²) — never exceeds c.
- **Light cone / causality**: events are timelike (causal), spacelike (no causal link), or
  lightlike. Simultaneity is relative. Spacetime interval s² = (cΔt)² − Δx² is invariant.
- *Puzzle hooks:* compute γ, dilated time, or contracted length at a given v (6); "ship at
  0.8c, how much ship-time for a 10-ly trip" (6,10); causality check — can event A cause B
  given Δx,Δt (4,5).

## §Relativity (general)
- **Equivalence principle**: gravity ≈ acceleration locally. Mass curves spacetime; objects
  follow **geodesics** ("straightest" paths in curved spacetime).
- **Gravitational time dilation**: clocks run slower deeper in a gravity well
  (factor √(1−2GM/rc²)). GPS satellites correct for it.
- **Black holes**: **Schwarzschild radius** r_s = 2GM/c² (event horizon). Inside, all paths
  lead inward. Singularity at center. Spinning → Kerr; charged → Reissner–Nordström.
- **Gravitational waves**: ripples in spacetime from accelerating masses (LIGO detected
  merging black holes, 2015).
- **Gravitational lensing**: mass bends light → Einstein rings, multiple images.
- **Exotica**: wormholes (Einstein–Rosen bridges), closed timelike curves (time-loop fuel).
- *Puzzle hooks:* compute a black hole's Schwarzschild radius from its mass (6); rank clocks
  by depth in a gravity well (7,10); "how much does this mass bend the path" (6); a GATEWAY
  as an event horizon you can only `ENTER_SUB`, never return without RESET.

---

# THE UNIVERSE

## §Astrophysics (stars, galaxies, objects)
- **Stars** fuse H→He (then heavier elements in massive stars). **HR diagram** plots
  luminosity vs temperature; main sequence runs hot-bright (blue, O) to cool-dim (red, M).
  Spectral classes **O B A F G K M** (hot→cool; mnemonic "Oh Be A Fine Guy/Girl, Kiss Me").
  The Sun is a G2 main-sequence star (~5,778 K surface).
- **Stellar death by mass**: low mass → red giant → planetary nebula → **white dwarf**;
  high mass → **supernova** → **neutron star** (or **pulsar**, spinning, beaming) →
  if massive enough, **black hole**. Chandrasekhar limit ≈ 1.4 M☉ (white-dwarf cap).
- **Galaxies**: spiral (like the Milky Way), elliptical, irregular. Milky Way ≈ 100,000 ly
  across, ~100–400 billion stars; we orbit the center (~26,000 ly out) once per ~225–250 Myr.
- **Local structure**: Earth → Solar System → Local Interstellar Cloud → Local Bubble →
  Orion Arm → Milky Way → Local Group → Virgo Supercluster → Laniakea → observable universe.
- **Solar System order**: Mercury, Venus, Earth, Mars, (asteroid belt), Jupiter, Saturn,
  Uranus, Neptune. Largest planet Jupiter; densest Earth; hottest surface Venus.
- *Puzzle hooks:* order stars by temperature/spectral class (7,11); classify a remnant by
  progenitor mass (11); rank cosmic structures by size (7); "which body breaks the
  distance-ordering" decoy (5).

## §Cosmology (origins & expansion)
- **Big Bang** ≈ 13.8 billion years ago; universe has been expanding since. Timeline:
  inflation → quark soup → nucleosynthesis (H, He, Li) → recombination (~380,000 yr, atoms
  form, light freed = the **CMB**) → first stars → galaxies.
- **Cosmic Microwave Background**: relic radiation, now ~2.725 K, nearly uniform — the oldest
  light we can see.
- **Expansion / Hubble–Lemaître**: v = H₀·d (recession speed ∝ distance); H₀ ≈ 70 km/s/Mpc.
  Distant galaxies redshift; expansion is **accelerating**.
- **Energy budget**: ~68% dark energy, ~27% dark matter, ~5% ordinary matter. Dark matter
  binds galaxies (explains rotation curves); dark energy drives acceleration.
- **Redshift** z: longer observed wavelength → higher z → farther/older. 1+z = λ_obs/λ_emit.
- *Puzzle hooks:* compute recession speed from distance via Hubble (6); order epochs of the
  early universe (2); "given the energy pie, what fraction is visible matter" (7); redshift→
  distance estimate (6).

## §Scale, constants & cosmic numbers
- **Distance units**: 1 AU = 1.496×10⁸ km (Earth–Sun); 1 light-year ≈ 9.46×10¹² km ≈ 63,241 AU;
  1 parsec ≈ 3.26 ly. Nearest star Proxima Centauri ≈ 4.24 ly.
- **Light travel time** (rough): Sun→Earth ~8 min 20 s; Earth→Moon ~1.28 s; across Milky
  Way ~100,000 yr.
- **Powers of ten / orders of magnitude**: atom ~10⁻¹⁰ m; human ~10⁰ m; Earth ~10⁷ m;
  Sun ~10⁹ m; Solar System ~10¹³ m; galaxy ~10²¹ m; observable universe ~10²⁷ m (~93 Gly across).
- **Key constants**: c=2.998×10⁸ m/s; G=6.674×10⁻¹¹; h=6.626×10⁻³⁴ J·s; ħ=1.055×10⁻³⁴;
  k_B=1.381×10⁻²³ J/K; e=1.602×10⁻¹⁹ C; N_A=6.022×10²³ /mol; electron mass 9.109×10⁻³¹ kg;
  proton mass 1.673×10⁻²⁷ kg.
- **Drake equation** (number of contactable civilizations):
  N = R⋆·f_p·n_e·f_l·f_i·f_c·L. **Fermi paradox**: "where is everybody?"
- *Puzzle hooks:* unit conversions ly↔AU↔km (7); order objects by size (7); dimensional-
  analysis "which combination of constants gives units of time/length" (Planck units, 6);
  light-delay timing puzzles tied to the HUD clock (6).

## §Chaos & dynamical systems (bonus puzzle fuel)
- **Sensitive dependence** ("butterfly effect"): tiny initial changes → large divergence
  (weather, three-body problem). Deterministic but unpredictable long-term.
- **Logistic map** xₙ₊₁ = r·xₙ·(1−xₙ): period-doubling → chaos as r grows past ~3.57.
- **Cellular automata** (Conway's Life): simple local rules → complex global behavior;
  fully deterministic → perfect for "predict the state after N steps."
- **Lagrange points** (L1–L5): gravitational balance points in a two-body system; L4/L5 stable.
- *Puzzle hooks:* run a cellular automaton N steps and ask the result (10, simulation —
  validate by running the same deterministic sim); next logistic-map value (2,10); which
  Lagrange point is stable (11).

---

## Using this codex with the generator

For any puzzle: pick a section, pick a formula/fact, choose which value is the unknown,
sample the knowns from a seeded RNG inside clean ranges, compute the answer in the
validator, and present the rest as the clue. Because both clue and answer come from the
same seed (see `docs/PUZZLE-DESIGN.md` §4), every puzzle is reproducible and auto-checkable.
Cross-link archetypes (decode → then compute → then path) to build the deep, multi-node
puzzles that fill the Core tier.
