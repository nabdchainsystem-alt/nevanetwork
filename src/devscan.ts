/**
 * Dev Scan locator channel — render-free, like `telemetry`. FlyCamera writes the
 * nearest-gateway readout every frame (cheap: a handful of gateways); the HUD samples
 * it a few times a second, and the App's `G` shortcut reads it on demand. Independent
 * of the React `devScan` toggle, so `G` (focus nearest gateway) works even with the
 * overlay off.
 */
export const devScanInfo = {
  gatewayCount: 0, // gateways in the current depth
  nearestId: -1, // node index of the nearest gateway to the camera (-1 = none)
  nearestDist: 0, // world distance to it
};
