/**
 * Visible-route system (Visual Upgrade — link readability, all sectors).
 *
 * The network keeps its full LOGICAL graph (network.ts `NETWORK.edges` for A01, sectorGen
 * `GeneratedSector.net.edges` for A02) for structure/pathfinding. What the player SEES is a tiered
 * set of VISIBLE ROUTES: faint background structure + a few meaningful, brighter routes — so the
 * field reads as data routes, not a permanent spiderweb.
 *
 * This module centralizes the route CATEGORIES + their look. Rendering is done per-edge on the
 * existing batched LineSegments (vertex colour magnitude encodes the route's opacity, one global
 * uOpacity scales it) — no per-frame geometry rebuild, no component-per-line. The brighter category
 * routes (traced / corrupted / gateway / objective / data-stream / private-grid) are drawn by their
 * existing dedicated overlays (`SelectedNodeFocus`, `CorruptedLinks`, `ObjectiveRouteLinks`,
 * `ActionEffects`); this module owns STRUCTURAL + the A02 bridge tier and the shared constants.
 */

export type RouteKind =
  | 'STRUCTURAL' // faint background connection (most links, most of the time)
  | 'DATA_ROUTE' // temporary stream on EXPORT (ActionEffects)
  | 'TRACE_ROUTE' // revealed by TRACE LINKS — brighter, stable (SelectedNodeFocus + NodeConnections traced tint)
  | 'GATEWAY_ROUTE' // teal-ice directional route toward a gateway (ObjectiveRouteLinks / A02 bridges)
  | 'CORRUPTED_ROUTE' // broken/dashed/flicker caution (CorruptedLinks)
  | 'FIREWALL_ROUTE' // segmented/blocked restricted look (ObjectiveRouteLinks firewall kind)
  | 'PRIVATE_GRID_ROUTE' // stable route around HOME / the private grid (PlayerSubnetwork)
  | 'OBJECTIVE_ROUTE'; // subtle highlight toward the current mission target (ObjectiveRouteLinks)

export interface RouteStyle {
  /** base RGB (muted, additive+bloom add the glow — no arcade colour). */
  color: [number, number, number];
  /** target effective opacity for this category (before distance fade). */
  opacity: number;
}

/** Category look-up (muted NEVA palette). Used for documentation + the structural/bridge tiers; the
 *  dedicated overlays carry their own tuned shaders for the animated categories. */
export const ROUTE_STYLES: Record<RouteKind, RouteStyle> = {
  STRUCTURAL: { color: [0.5, 0.52, 0.58], opacity: 0.09 },
  DATA_ROUTE: { color: [0.85, 0.92, 1.0], opacity: 0.6 },
  TRACE_ROUTE: { color: [0.78, 0.9, 1.0], opacity: 0.5 },
  GATEWAY_ROUTE: { color: [0.5, 0.88, 1.04], opacity: 0.55 },
  CORRUPTED_ROUTE: { color: [0.66, 0.28, 0.29], opacity: 0.5 },
  FIREWALL_ROUTE: { color: [0.72, 0.82, 1.05], opacity: 0.42 },
  PRIVATE_GRID_ROUTE: { color: [0.7, 0.95, 1.0], opacity: 0.45 },
  OBJECTIVE_ROUTE: { color: [0.82, 0.9, 1.0], opacity: 0.5 },
};

// --- shared resting-mesh tiers (per-vertex colour MAGNITUDE = relative opacity within the mesh) ---
// Structural links are a faint hint; far structural links fade further (handled by the line fade
// material). Dev Scan lifts structural toward the full logical graph for debugging.
export const STRUCT_NEAR = 0.42; // structural vertex brightness in normal play (× the mesh uOpacity)
export const STRUCT_DEV = 0.95; // Dev Scan — show the underlying logical graph clearly
export const BRIDGE_BRIGHT = 0.95; // A02 long bridge routes — the meaningful "suggests scale" routes
export const TRACED_BRIGHT = 0.92; // a scanned/traced endpoint reads as a bright stable route
