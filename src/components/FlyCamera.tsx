import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { telemetry } from '../telemetry';
import { touchInput } from '../touchInput';
import { devScanInfo } from '../devscan';
import { uiCapture } from '../uiCapture';
import { terminalNav } from '../terminalNav';
import { SPAWN, LOOK_AT } from '../world';
import { NETWORK, INTERACTIVE_COUNT } from '../network';
import { gatewaysAtDepth, nodeType } from '../game';

interface Props {
  selected: number | null;
  onSelect: (i: number | null) => void;
  onHoverChange: (i: number | null) => void;
  onLockChange?: (locked: boolean) => void;
  hitRef: RefObject<THREE.InstancedMesh | null>; // invisible enlarged pick targets
  gridRef: RefObject<THREE.Group | null>; // the slowly counter-rotating network
  diveSeed: number; // bumps when entering a subnetwork -> small forward dive
  gatewayNode: number | null;
  depth: number; // current depth — selects which gateway set the locator tracks
  onFocusReadyChange?: (node: number | null) => void;
  guideNode?: number | null; // Mission 00: gently FRAME this node without selecting it (no panel)
}

const BASE_SPEED = 39;
const BOOST = 3.1;
const LOOK_SENS = 0.0022;
const ARROW_LOOK = 1.6; // rad/s — arrow keys act like the mouse
const ACCEL_DAMP = 4.5;
const DECEL_DAMP = 1.7;
const LOOK_DAMP = 24;

// the perpetual orbit
const ORBIT_SPEED = 0.02205; // rad/s — camera circles the current centre
// Hard ceiling on how fast the VIEW may turn while orbiting. The orbit keeps moving the camera as
// before; this only stops big reorientations (re-facing centre after free-look, select/deselect,
// a near-vertical look-at flip) from whipping the player around. The steady orbit (~0.022 rad/s)
// is far under this, so the orbit itself is untouched — the player just spins at a normal rate.
const MAX_TURN = 0.9; // rad/s
const GRID_SPEED = 0.012; // rad/s — grid counter-rotates (idle overview only)
const OVERVIEW_RADIUS = 191; // standoff when orbiting the whole cloud
const OVERVIEW_HEIGHT = 26; // camera height above the cloud centre
const NODE_RADIUS = 18; // standoff when orbiting a focused node
const NODE_HEIGHT = 5; // camera height above the focused node
const GUIDE_RADIUS = 30; // wider standoff when GUIDING (framing) a node — a calm frame, not a dive
const CENTRE_LERP = 1.44; // how fast the orbit centre/radius ease to a new target (lower = smoother glide); +20% over 1.2 = a quicker dive to a node
const FOCUS_PANEL_PROGRESS = 0.85; // open node panels once the focus glide is 85% complete
const FREE_RESUME = 1.0; // idle seconds after manual flight before orbit resumes
// On deselect (click-away / R) the camera glides back to the overview with a smooth EASE-IN-OUT
// over this many seconds. The slow start lets the inspection/info panels close in place; then it
// accelerates and softly lands at the overview — one continuous motion, no freeze / yank / cut.
const RETURN_DUR = 1.6;

// --- touch tuning ---
const TAP_MOVE_PX = 10; // finger travel under this (and quick) = a tap, not a drag
const TAP_TIME_MS = 350; // max press duration to still count as a tap
const TOUCH_LOOK_SENS = 0.0052; // fly-mode drag-to-look, rad per screen px
const ORBIT_DRAG_SENS = 0.0072; // orbit-mode horizontal drag, rad per screen px
const ORBIT_V_SENS = 0.16; // orbit-mode vertical drag, world units per screen px
const PINCH_SENS = 0.5; // orbit-mode pinch, world units per px of finger-gap change
const ORBIT_RADIUS_MIN = 12;
const ORBIT_RADIUS_MAX = 340;
const ORBIT_HEIGHT_LIM = 160;

// --- desktop mouse: wheel zoom + middle-button (wheel) drag to LOOK around (yaw/pitch) ---
const WHEEL_SENS = 0.12; // radius change per unit of wheel deltaY (scroll = zoom)
const MOUSE_LOOK_SENS = 0.004; // rad per px — hold the wheel button and drag to look (head / eyes)
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const focusPanelProgressForTravel = (travel: number) => {
  // Do not speed up the camera. If the retarget is nearby, open the panel once
  // the camera is near enough instead of forcing a full 85% ease wait.
  if (travel < 18) return 0.12;
  if (travel < 42) return 0.28;
  if (travel < 80) return 0.48;
  if (travel < 150) return 0.68;
  return FOCUS_PANEL_PROGRESS;
};

// movement / look keys that dismiss the inspection panel and resume flight.
// (Space is NOT here — it is owned by the NEVA Terminal, never flight. KeyE is NOT here
// either — while a node is inspected E means EXPORT; E only ascends during free flight.)
const NAV_KEYS = [
  'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyC',
  'ControlLeft', 'ControlRight',
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
];

const _euler = new THREE.Euler(0, 0, 0, 'YXZ');
const _lookM = new THREE.Matrix4();
const _origin = new THREE.Vector3(LOOK_AT[0], LOOK_AT[1], LOOK_AT[2]);
const _up = new THREE.Vector3(0, 1, 0);
const _ndc = new THREE.Vector2();
const _ray = new THREE.Raycaster();
const _q = new THREE.Quaternion();
const _v = new THREE.Vector3();
const _proj = new THREE.Vector3();
const PICK_TOL_PX = 38; // CSS-px catch radius for the CLICK/TAP-ONLY far-pick fallback

/**
 * One-shot screen-space fallback for CLICKS / TAPS ONLY — never hover, never per-frame, so it can't
 * churn the hover or hijack the camera. When a click ray misses every hit-sphere (a far node is a
 * tiny target), pick the projected interactive node nearest the cursor that is in front of the
 * camera, inside the viewport, and within `tolPx` (small depth tiebreak so a far background node
 * can't beat a closer visible one). Returns null in empty space → an empty click still deselects.
 */
function nearestNodeFallback(
  ndc: THREE.Vector2,
  camera: THREE.Camera,
  grid: THREE.Object3D | null,
  width: number,
  height: number,
  tolPx: number,
): number | null {
  if (width <= 0 || height <= 0) return null;
  let mat: THREE.Matrix4 | null = null;
  if (grid) {
    grid.updateWorldMatrix(true, false);
    mat = grid.matrixWorld;
  }
  const cx = (ndc.x * 0.5 + 0.5) * width;
  const cy = (-ndc.y * 0.5 + 0.5) * height;
  const DEPTH_W = 8;
  let best = -1;
  let bestScore = Infinity;
  const p = NETWORK.positions;
  for (let i = 0; i < INTERACTIVE_COUNT; i++) {
    _proj.set(p[i * 3], p[i * 3 + 1], p[i * 3 + 2]);
    if (mat) _proj.applyMatrix4(mat);
    _proj.project(camera);
    if (_proj.z < -1 || _proj.z > 1) continue; // behind / beyond the frustum
    if (Math.abs(_proj.x) > 1.06 || Math.abs(_proj.y) > 1.06) continue; // outside the viewport
    const sx = (_proj.x * 0.5 + 0.5) * width;
    const sy = (-_proj.y * 0.5 + 0.5) * height;
    const dx = sx - cx;
    const dy = sy - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > tolPx) continue;
    const score = dist + (_proj.z + 1) * 0.5 * DEPTH_W;
    if (score < bestScore) {
      bestScore = score;
      best = i;
    }
  }
  return best >= 0 ? best : null;
}

/**
 * Camera for the network explorer — a single PERPETUAL ORBIT.
 *  - Idle: slowly circles the whole cloud while the grid counter-rotates.
 *  - Select a node: the orbit centre + radius smoothly lerp in, so the camera
 *    glides to the node and keeps orbiting around it (never stops).
 *  - R / OVERVIEW / Esc / empty click: the centre + radius lerp back out to the
 *    overview orbit — a smooth continuation, no warp, no pause, no FOV punch.
 *  - WASD / mouse-look temporarily take manual control; the orbit resumes ~1s
 *    after the last input, continuing from wherever the camera is.
 */
export default function FlyCamera({
  selected,
  onSelect,
  onHoverChange,
  onLockChange,
  hitRef,
  gridRef,
  diveSeed,
  gatewayNode,
  depth,
  onFocusReadyChange,
  guideNode,
}: Props) {
  const { camera, gl } = useThree();
  const gateways = useMemo(() => gatewaysAtDepth(depth), [depth]);

  const keys = useRef<Record<string, boolean>>({});
  const velocity = useRef(new THREE.Vector3());
  const yaw = useRef(0);
  const pitch = useRef(0);
  const targetYaw = useRef(0);
  const targetPitch = useRef(0);
  const locked = useRef(false);
  const selectedRef = useRef<number | null>(selected);
  const hoverRef = useRef<number | null>(null);
  const pointer = useRef(new THREE.Vector2(0, 0));
  const wheelLook = useRef(false); // middle (wheel) button held → drag to look around (head / eyes)

  // perpetual-orbit state
  const orbitAngle = useRef(0);
  const orbitRadius = useRef(OVERVIEW_RADIUS);
  const orbitRadiusTgt = useRef(OVERVIEW_RADIUS);
  const orbitHeight = useRef(OVERVIEW_HEIGHT); // height offset above the centre
  const orbitHeightTgt = useRef(OVERVIEW_HEIGHT);
  const orbitCentre = useRef(new THREE.Vector3());
  const orbitCentreTgt = useRef(new THREE.Vector3());
  const bobT0 = useRef(0); // bob phase anchor (set when orbit re-engages from flight)
  const freeIdle = useRef(FREE_RESUME + 1); // start in orbit, not flight
  const wasFree = useRef(false);
  // smooth ease-in-out glide back to the overview on deselect (replaces the old freeze-then-yank)
  const returning = useRef(false);
  const returnFromC = useRef(new THREE.Vector3());
  const returnFromR = useRef(OVERVIEW_RADIUS);
  const returnFromH = useRef(OVERVIEW_HEIGHT);
  const returnT0 = useRef(-1); // -1 = capture the start pose on the next orbit frame
  const focusNode = useRef<number | null>(selected);
  const focusReadyNode = useRef<number | null>(selected);
  const focusStartC = useRef(new THREE.Vector3());
  const focusStartR = useRef(OVERVIEW_RADIUS);
  const focusStartH = useRef(OVERVIEW_HEIGHT);
  const focusStartTravel = useRef(1);
  const focusPanelProgress = useRef(FOCUS_PANEL_PROGRESS);

  const syncLook = () => {
    const e = _euler.setFromQuaternion(camera.quaternion, 'YXZ');
    yaw.current = targetYaw.current = e.y;
    pitch.current = targetPitch.current = e.x;
  };

  // world-space position of a node (the grid may be rotated)
  const nodeWorld = (i: number) => {
    _v.set(NETWORK.positions[i * 3], NETWORK.positions[i * 3 + 1], NETWORK.positions[i * 3 + 2]);
    const g = gridRef.current;
    if (g) {
      g.updateWorldMatrix(true, false);
      _v.applyMatrix4(g.matrixWorld);
    }
    return _v;
  };

  const aimOverview = () => {
    orbitCentreTgt.current.copy(_origin);
    orbitRadiusTgt.current = OVERVIEW_RADIUS;
    orbitHeightTgt.current = OVERVIEW_HEIGHT;
  };

  const placeAtSpawn = () => {
    camera.position.set(SPAWN[0], SPAWN[1], SPAWN[2]);
    camera.lookAt(LOOK_AT[0], LOOK_AT[1], LOOK_AT[2]);
    syncLook();
    velocity.current.set(0, 0, 0);
    // seed the orbit so it begins exactly here
    orbitCentre.current.copy(_origin);
    orbitCentreTgt.current.copy(_origin);
    const dx = camera.position.x - _origin.x;
    const dz = camera.position.z - _origin.z;
    orbitRadius.current = orbitRadiusTgt.current = Math.hypot(dx, dz);
    orbitAngle.current = Math.atan2(dz, dx);
    orbitHeight.current = orbitHeightTgt.current = camera.position.y - _origin.y;
    freeIdle.current = FREE_RESUME + 1;
    wasFree.current = false;
  };

  useEffect(() => {
    placeAtSpawn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera]);

  // selecting a node retargets the orbit to circle it; deselecting eases back to overview
  useEffect(() => {
    selectedRef.current = selected;
    if (selected != null) {
      onFocusReadyChange?.(null);
      returning.current = false; // cancel any in-progress return — we're diving in
      const p = nodeWorld(selected);
      focusNode.current = selected;
      focusReadyNode.current = null;
      focusStartC.current.copy(orbitCentre.current);
      focusStartR.current = orbitRadius.current;
      focusStartH.current = orbitHeight.current;
      const travel = Math.hypot(
        focusStartC.current.distanceTo(p),
        focusStartR.current - NODE_RADIUS,
        focusStartH.current - NODE_HEIGHT,
      );
      focusStartTravel.current = Math.max(0.001, travel);
      focusPanelProgress.current = focusPanelProgressForTravel(travel);
      orbitCentreTgt.current.copy(p);
      orbitRadiusTgt.current = NODE_RADIUS;
      orbitHeightTgt.current = NODE_HEIGHT;
      onHoverChange(null);
      hoverRef.current = null;
      // Keep pointer lock (F mode) ON when a node is selected — selecting a node no longer drops
      // mouse-look flight. Mouse-look is gated off while a node is selected (see onMouseMove), so
      // the focus-dive still runs cleanly; press F or ESC to free the cursor for the panel.
    } else {
      // begin a smooth ease-in-out glide back to the overview. The start pose is captured on the
      // next orbit frame; the slow start lets the panels close in place, then it glides out —
      // one continuous motion (no freeze, no yank). aimOverview also sets the steady-state targets
      // the exp lerp holds once the glide finishes.
      aimOverview();
      focusNode.current = null;
      focusReadyNode.current = null;
      onFocusReadyChange?.(null);
      focusPanelProgress.current = FOCUS_PANEL_PROGRESS;
      returning.current = true;
      returnT0.current = -1;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, onHoverChange, onFocusReadyChange]);

  // Mission 00 GUIDE: gently FRAME the next tutorial node (no selection, no panel). Declared
  // AFTER the `selected` effect so when a step advance fires both (selected→null + new guideNode),
  // this runs last and wins — easing to the node and cancelling the would-be return-to-overview.
  // The player still has to click the node to dive in + open its panel (the select→explain beat).
  useEffect(() => {
    if (guideNode == null || selectedRef.current != null) return;
    const p = nodeWorld(guideNode);
    orbitCentreTgt.current.copy(p);
    orbitRadiusTgt.current = GUIDE_RADIUS;
    orbitHeightTgt.current = NODE_HEIGHT;
    returning.current = false; // ease toward the framed node rather than gliding back to overview
    // eslint-disable-next-line react-hooks/exhaustive-deps -- nodeWorld is a stable ref reader
  }, [guideNode]);

  // entering a subnetwork: pull the orbit a little closer to the gateway
  const lastDive = useRef(diveSeed);
  useEffect(() => {
    if (diveSeed === lastDive.current) return;
    lastDive.current = diveSeed;
    if (gatewayNode == null) return;
    const p = nodeWorld(gatewayNode);
    orbitCentreTgt.current.copy(p);
    orbitRadiusTgt.current = NODE_RADIUS * 0.7;
    orbitHeightTgt.current = NODE_HEIGHT;
    selectedRef.current = gatewayNode;
    // nodeWorld is a stable reader over refs — only re-run when the dive actually changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diveSeed, gatewayNode]);

  // provide the terminal's "go to <type>" lookup: nearest node of a type to the camera,
  // computed on demand against the live grid rotation (re-bound when the depth/layer changes
  // so node types resolve from the right mix).
  useEffect(() => {
    terminalNav.nearestOfType = (type) => {
      const g = gridRef.current;
      if (g) g.updateWorldMatrix(true, false);
      let best = -1;
      let bestD = Infinity;
      for (let i = 0; i < INTERACTIVE_COUNT; i++) {
        if (nodeType(i, depth) !== type) continue;
        _v.set(NETWORK.positions[i * 3], NETWORK.positions[i * 3 + 1], NETWORK.positions[i * 3 + 2]);
        if (g) _v.applyMatrix4(g.matrixWorld);
        const d = _v.distanceToSquared(camera.position);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      }
      return { id: best, dist: best >= 0 ? Math.sqrt(bestD) : 0 };
    };
    return () => {
      terminalNav.nearestOfType = () => ({ id: -1, dist: 0 });
    };
  }, [depth, camera, gridRef]);

  useEffect(() => {
    const canvas = gl.domElement;

    const pickNode = (fromCenter: boolean) => {
      const mesh = hitRef.current;
      if (fromCenter) _ndc.set(0, 0);
      else _ndc.copy(pointer.current);
      if (mesh) {
        _ray.setFromCamera(_ndc, camera);
        const hits = _ray.intersectObject(mesh, false);
        if (hits.length) return hits[0].instanceId ?? null;
      }
      // far-away help (click only): snap to the node nearest the cursor on screen, if any
      return nearestNodeFallback(_ndc, camera, gridRef.current, canvas.clientWidth, canvas.clientHeight, PICK_TOL_PX);
    };

    const onClick = () => {
      // ignore the synthetic click a browser fires after a touch tap — touchend already picked
      if (performance.now() - lastTouchAt < 600) return;
      const hit = pickNode(locked.current);
      if (hit != null) {
        onSelect(hit);
      } else if (selectedRef.current != null) {
        onSelect(null);
        onHoverChange(null);
        hoverRef.current = null;
      }
    };

    const onLock = () => {
      locked.current = document.pointerLockElement === canvas;
      onLockChange?.(locked.current);
      if (!locked.current) keys.current = {};
    };

    // middle-button (wheel) drag = rotate / raise the orbit, like a 1-finger touch orbit-drag
    let midDrag = false;
    let midLastX = 0;
    let midLastY = 0;

    const onMouseMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.current.set(
        ((e.clientX - r.left) / r.width) * 2 - 1,
        -((e.clientY - r.top) / r.height) * 2 + 1,
      );
      if (midDrag) {
        const dx = e.clientX - midLastX;
        const dy = e.clientY - midLastY;
        midLastX = e.clientX;
        midLastY = e.clientY;
        // Hold the wheel button + drag to LOOK around — turn the view like your head/eyes. This
        // drives the manual-flight look path (yaw/pitch); the frame loop keeps flight engaged
        // while the button is held (see wheelLook), so the camera pivots in place, not orbits.
        freeIdle.current = 0;
        targetYaw.current -= dx * MOUSE_LOOK_SENS;
        targetPitch.current -= dy * MOUSE_LOOK_SENS;
        const lim = Math.PI / 2 - 0.04;
        targetPitch.current = Math.max(-lim, Math.min(lim, targetPitch.current));
        return;
      }
      if (locked.current && selectedRef.current == null) {
        freeIdle.current = 0; // mouse-look = manual control
        targetYaw.current -= e.movementX * LOOK_SENS;
        targetPitch.current -= e.movementY * LOOK_SENS;
        const lim = Math.PI / 2 - 0.04;
        targetPitch.current = Math.max(-lim, Math.min(lim, targetPitch.current));
      }
    };

    // middle mouse down/up — begin/end the rotate-drag (preventDefault stops autoscroll)
    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 1) return;
      e.preventDefault();
      returning.current = false; // a manual look gesture takes over the return glide
      midDrag = true;
      wheelLook.current = true;
      midLastX = e.clientX;
      midLastY = e.clientY;
    };
    const onMouseUp = (e: MouseEvent) => {
      if (e.button === 1) {
        midDrag = false;
        wheelLook.current = false;
      }
    };

    // wheel = zoom (orbit radius). Works whether orbiting the overview or a focused node.
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      returning.current = false; // zooming takes over the return glide
      orbitRadiusTgt.current = clamp(
        orbitRadiusTgt.current + e.deltaY * WHEEL_SENS,
        ORBIT_RADIUS_MIN,
        ORBIT_RADIUS_MAX,
      );
    };

    const ARROWS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    const onKeyDown = (e: KeyboardEvent) => {
      if (uiCapture.active) return; // terminal owns the keyboard — no flight / focus changes
      if (e.code === 'KeyF') {
        if (document.pointerLockElement === canvas) document.exitPointerLock();
        else if (selectedRef.current == null) canvas.requestPointerLock();
        return;
      }
      if (e.code === 'Escape') {
        onSelect(null);
        onHoverChange(null);
        hoverRef.current = null;
        return;
      }
      if (e.code === 'KeyR') {
        if (selectedRef.current != null) {
          // a panel is open: close it IN PLACE — just deselect. The deselect effect holds the
          // camera on the node through the close, then eases back to overview (no instant yank).
          onSelect(null);
          onHoverChange(null);
          hoverRef.current = null;
        } else {
          // free flight, nothing selected: snap the orbit straight back to overview
          aimOverview();
        }
        return;
      }
      // a movement / look key dismisses the panel and resumes free flight
      if (selectedRef.current != null && NAV_KEYS.includes(e.code)) {
        syncLook();
        onSelect(null);
        onHoverChange(null);
        hoverRef.current = null;
      }
      keys.current[e.code] = true;
      if (
        ARROWS.includes(e.code) ||
        (locked.current && ['ControlLeft', 'ControlRight'].includes(e.code))
      ) {
        e.preventDefault();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (uiCapture.active) return;
      keys.current[e.code] = false;
    };

    // pick at a CSS-pixel point (used by touch taps): exact ray hit first, then far-pick fallback
    const pickAtClient = (clientX: number, clientY: number) => {
      const r = canvas.getBoundingClientRect();
      _ndc.set(
        ((clientX - r.left) / r.width) * 2 - 1,
        -((clientY - r.top) / r.height) * 2 + 1,
      );
      const mesh = hitRef.current;
      if (mesh) {
        _ray.setFromCamera(_ndc, camera);
        const hits = _ray.intersectObject(mesh, false);
        if (hits.length) return hits[0].instanceId ?? null;
      }
      return nearestNodeFallback(_ndc, camera, gridRef.current, canvas.clientWidth, canvas.clientHeight, PICK_TOL_PX);
    };
    const setPointerFromClient = (clientX: number, clientY: number) => {
      const r = canvas.getBoundingClientRect();
      pointer.current.set(
        ((clientX - r.left) / r.width) * 2 - 1,
        -((clientY - r.top) / r.height) * 2 + 1,
      );
    };

    // ---- touch: orbit-drag / pinch / fly-look, with tap-to-pick ----
    // ORBIT mode: 1-finger drag orbits, 2-finger pinch zooms. FLY mode: 1-finger
    // drag looks. A quick near-stationary touch is a tap → pick the node under it.
    let tStartX = 0, tStartY = 0, tStartT = 0, tLastX = 0, tLastY = 0;
    let tDragging = false, tPinching = false, pinchLast = 0, lastTouchAt = 0;
    const dist2 = (a: Touch, b: Touch) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);

    const onTouchStart = (e: TouchEvent) => {
      lastTouchAt = performance.now();
      if (e.touches.length === 1) {
        const t = e.touches[0];
        tStartX = tLastX = t.clientX;
        tStartY = tLastY = t.clientY;
        tStartT = performance.now();
        tDragging = false;
        tPinching = false;
        setPointerFromClient(t.clientX, t.clientY);
      } else if (e.touches.length === 2) {
        tPinching = true;
        tDragging = false;
        pinchLast = dist2(e.touches[0], e.touches[1]);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      lastTouchAt = performance.now();
      if (tPinching && e.touches.length >= 2) {
        const d = dist2(e.touches[0], e.touches[1]);
        touchInput.pinchDelta += d - pinchLast;
        pinchLast = d;
        e.preventDefault();
        return;
      }
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      const dx = t.clientX - tLastX;
      const dy = t.clientY - tLastY;
      tLastX = t.clientX;
      tLastY = t.clientY;
      setPointerFromClient(t.clientX, t.clientY);
      if (!tDragging && Math.hypot(t.clientX - tStartX, t.clientY - tStartY) > TAP_MOVE_PX) {
        tDragging = true;
        // starting a drag in fly mode hands control back from a focused node
        if (touchInput.mode === 'fly' && selectedRef.current != null) {
          onSelect(null);
          onHoverChange(null);
          hoverRef.current = null;
        }
      }
      if (tDragging) {
        if (touchInput.mode === 'fly') {
          touchInput.lookDX += dx;
          touchInput.lookDY += dy;
        } else {
          touchInput.orbitDX += dx;
          touchInput.orbitDY += dy;
        }
        e.preventDefault();
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      lastTouchAt = performance.now();
      if (tPinching && e.touches.length < 2) tPinching = false;
      if (!tDragging && !tPinching && performance.now() - tStartT < TAP_TIME_MS) {
        const hit = pickAtClient(tStartX, tStartY);
        if (hit != null) {
          onSelect(hit);
        } else if (selectedRef.current != null) {
          onSelect(null);
          onHoverChange(null);
          hoverRef.current = null;
        }
      }
      if (e.touches.length === 0) tDragging = false;
    };

    canvas.addEventListener('click', onClick);
    document.addEventListener('pointerlockchange', onLock);
    document.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd);
    canvas.addEventListener('touchcancel', onTouchEnd);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      canvas.removeEventListener('click', onClick);
      document.removeEventListener('pointerlockchange', onLock);
      document.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('touchcancel', onTouchEnd);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, camera, onSelect, onHoverChange, onLockChange, hitRef]);

  const forward = useRef(new THREE.Vector3());
  const right = useRef(new THREE.Vector3());
  const desired = useRef(new THREE.Vector3());
  const worldUp = new THREE.Vector3(0, 1, 0);

  const runHover = () => {
    const mesh = hitRef.current;
    if (!mesh) return;
    // hover follows the exact ray only (cheap + stable) — no per-frame screen-space fallback, so the
    // auto-orbit never churns the hover / steals selection. The far-pick fallback is click-only.
    _ndc.copy(locked.current ? _ndc.set(0, 0) : pointer.current);
    _ray.setFromCamera(_ndc, camera);
    const hits = _ray.intersectObject(mesh, false);
    const id = hits.length ? hits[0].instanceId ?? null : null;
    if (id !== hoverRef.current) {
      hoverRef.current = id;
      onHoverChange(id);
    }
  };

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const t = state.clock.elapsedTime;
    const k = keys.current;
    const ti = touchInput;
    // consume this frame's accumulated touch deltas once (each pixel used once)
    const tLookX = ti.lookDX, tLookY = ti.lookDY;
    const tOrbX = ti.orbitDX, tOrbY = ti.orbitDY, tPinch = ti.pinchDelta;
    ti.lookDX = ti.lookDY = ti.orbitDX = ti.orbitDY = ti.pinchDelta = 0;
    // fly-mode touch (joystick / look) counts as manual flight, like WASD
    const flyTouch =
      ti.mode === 'fly' &&
      (Math.abs(ti.moveX) > 0.02 || Math.abs(ti.moveZ) > 0.02 || ti.lift !== 0 ||
        tLookX !== 0 || tLookY !== 0);

    // maintain the dev gateway locator readout (cheap: a handful of gateways). Always on,
    // so the G "focus nearest gateway" shortcut works whether or not the overlay is shown.
    {
      const g = gridRef.current;
      if (g) g.updateWorldMatrix(true, false);
      let best = -1;
      let bestD = Infinity;
      for (const gi of gateways) {
        _v.set(NETWORK.positions[gi * 3], NETWORK.positions[gi * 3 + 1], NETWORK.positions[gi * 3 + 2]);
        if (g) _v.applyMatrix4(g.matrixWorld);
        const d = _v.distanceToSquared(camera.position);
        if (d < bestD) {
          bestD = d;
          best = gi;
        }
      }
      devScanInfo.gatewayCount = gateways.length;
      devScanInfo.nearestId = best;
      devScanInfo.nearestDist = best >= 0 ? Math.sqrt(bestD) : 0;
    }

    const moveInput =
      k['KeyW'] || k['KeyS'] || k['KeyA'] || k['KeyD'] ||
      k['KeyQ'] || k['KeyE'] || k['KeyC'] || k['ControlLeft'] || k['ControlRight'] ||
      k['ArrowUp'] || k['ArrowDown'] || k['ArrowLeft'] || k['ArrowRight'];
    if (moveInput || flyTouch || wheelLook.current) freeIdle.current = 0;
    else freeIdle.current += delta;

    // manual flight only when no node is selected and there's recent input
    const free = selectedRef.current == null && freeIdle.current < FREE_RESUME;

    // ============================ MANUAL FLIGHT ============================
    if (free) {
      wasFree.current = true;
      returning.current = false; // manual flight cancels the return glide

      if (k['ArrowLeft']) targetYaw.current += ARROW_LOOK * delta;
      if (k['ArrowRight']) targetYaw.current -= ARROW_LOOK * delta;
      if (k['ArrowUp']) targetPitch.current += ARROW_LOOK * delta;
      if (k['ArrowDown']) targetPitch.current -= ARROW_LOOK * delta;
      // fly-mode drag-to-look (touch)
      if (ti.mode === 'fly') {
        targetYaw.current -= tLookX * TOUCH_LOOK_SENS;
        targetPitch.current -= tLookY * TOUCH_LOOK_SENS;
      }
      const lim = Math.PI / 2 - 0.04;
      targetPitch.current = Math.max(-lim, Math.min(lim, targetPitch.current));

      const lk = 1 - Math.exp(-LOOK_DAMP * delta);
      yaw.current += (targetYaw.current - yaw.current) * lk;
      pitch.current += (targetPitch.current - pitch.current) * lk;
      const swayYaw = Math.sin(t * 0.5) * 0.004 + Math.sin(t * 0.23) * 0.0028;
      const swayPitch = Math.sin(t * 0.4 + 1.3) * 0.003;
      const swayRoll = Math.sin(t * 0.31) * 0.004;
      camera.quaternion.setFromEuler(
        new THREE.Euler(pitch.current + swayPitch, yaw.current + swayYaw, swayRoll, 'YXZ'),
      );

      camera.getWorldDirection(forward.current);
      right.current.crossVectors(forward.current, worldUp).normalize();
      desired.current.set(0, 0, 0);
      if (k['KeyW']) desired.current.add(forward.current);
      if (k['KeyS']) desired.current.sub(forward.current);
      if (k['KeyD']) desired.current.add(right.current);
      if (k['KeyA']) desired.current.sub(right.current);
      if (k['KeyE']) desired.current.add(worldUp); // E = up / ascend (standard 3D nav)
      if (k['KeyQ'] || k['KeyC'] || k['ControlLeft'] || k['ControlRight']) desired.current.sub(worldUp); // Q/C/Ctrl = down / descend
      // fly-mode virtual joystick + up/down buttons (touch)
      if (ti.mode === 'fly') {
        desired.current.addScaledVector(forward.current, -ti.moveZ); // stick up = forward
        desired.current.addScaledVector(right.current, ti.moveX);
        if (ti.lift) desired.current.addScaledVector(worldUp, ti.lift);
      }

      const boosting = k['ShiftLeft'] || k['ShiftRight'];
      const speed = BASE_SPEED * (boosting ? BOOST : 1);
      const hasInput = desired.current.lengthSq() > 0;
      if (hasInput) desired.current.normalize().multiplyScalar(speed);
      const damp = hasInput ? ACCEL_DAMP : DECEL_DAMP;
      velocity.current.lerp(desired.current, 1 - Math.exp(-damp * delta));
      camera.position.addScaledVector(velocity.current, delta);

      telemetry.x = camera.position.x;
      telemetry.y = camera.position.y;
      telemetry.z = camera.position.z;
      telemetry.speed = velocity.current.length();
      runHover();
      return;
    }

    // ============================ PERPETUAL ORBIT ============================
    // re-seed the orbit from the camera's current pose when we just left flight,
    // so manual control hands back without any jump
    if (wasFree.current) {
      wasFree.current = false;
      if (selectedRef.current == null) {
        // Re-engage the idle orbit WITHOUT reordering the view: make the point the player is
        // already looking at the new orbit centre. lookAt(centre) then equals their current
        // heading, so nothing snaps/spins — the gentle orbit just circles what they were viewing.
        camera.getWorldDirection(forward.current);
        const R = clamp(camera.position.distanceTo(orbitCentre.current), NODE_RADIUS, OVERVIEW_RADIUS);
        orbitCentre.current.copy(camera.position).addScaledVector(forward.current, R);
        orbitCentreTgt.current.copy(orbitCentre.current); // hold here — don't drift back to the cloud centre
        const dx = camera.position.x - orbitCentre.current.x;
        const dz = camera.position.z - orbitCentre.current.z;
        orbitRadius.current = orbitRadiusTgt.current = Math.hypot(dx, dz);
        orbitAngle.current = Math.atan2(dz, dx);
        orbitHeight.current = orbitHeightTgt.current = camera.position.y - orbitCentre.current.y;
      } else {
        // a node is selected — keep its focus target, just re-seed the orbit params from the pose
        const c = orbitCentre.current;
        const dx = camera.position.x - c.x;
        const dz = camera.position.z - c.z;
        orbitRadius.current = Math.hypot(dx, dz);
        orbitAngle.current = Math.atan2(dz, dx);
        orbitHeight.current = camera.position.y - c.y;
      }
      bobT0.current = t;
      velocity.current.set(0, 0, 0);
    }

    // orbit-mode touch: 1-finger drag rotates / raises, pinch zooms. Applied to
    // the targets (and angle directly) so the existing ease carries them in.
    if (ti.mode === 'orbit' && (tOrbX || tOrbY || tPinch)) {
      returning.current = false; // touch orbit takes over the return glide
      orbitAngle.current -= tOrbX * ORBIT_DRAG_SENS;
      orbitHeightTgt.current = clamp(
        orbitHeightTgt.current - tOrbY * ORBIT_V_SENS, -ORBIT_HEIGHT_LIM, ORBIT_HEIGHT_LIM,
      );
      orbitRadiusTgt.current = clamp(
        orbitRadiusTgt.current - tPinch * PINCH_SENS, ORBIT_RADIUS_MIN, ORBIT_RADIUS_MAX,
      );
    }

    // RETURN GLIDE: a time-based ease-in-out (smoothstep) from the deselect pose to the overview.
    // Slow start (panels close in place) → glide → soft landing. One continuous motion, no cut.
    if (returning.current && selectedRef.current == null) {
      if (returnT0.current < 0) {
        returnFromC.current.copy(orbitCentre.current);
        returnFromR.current = orbitRadius.current;
        returnFromH.current = orbitHeight.current;
        returnT0.current = t;
      }
      const p = Math.min(1, (t - returnT0.current) / RETURN_DUR);
      const e = p * p * (3 - 2 * p); // smoothstep — eases in AND out
      orbitCentre.current.lerpVectors(returnFromC.current, _origin, e);
      orbitRadius.current = returnFromR.current + (OVERVIEW_RADIUS - returnFromR.current) * e;
      orbitHeight.current = returnFromH.current + (OVERVIEW_HEIGHT - returnFromH.current) * e;
      if (p >= 1) returning.current = false;
    } else {
      // ease the orbit centre / radius / height toward their targets (the glide-in on select,
      // touch retargets, and the steady hold after a return finishes)
      const lr = 1 - Math.exp(-CENTRE_LERP * delta);
      orbitCentre.current.lerp(orbitCentreTgt.current, lr);
      orbitRadius.current += (orbitRadiusTgt.current - orbitRadius.current) * lr;
      orbitHeight.current += (orbitHeightTgt.current - orbitHeight.current) * lr;
    }

    if (
      selectedRef.current != null &&
      focusNode.current === selectedRef.current &&
      focusReadyNode.current !== selectedRef.current
    ) {
      const remaining = Math.hypot(
        orbitCentre.current.distanceTo(orbitCentreTgt.current),
        orbitRadius.current - orbitRadiusTgt.current,
        orbitHeight.current - orbitHeightTgt.current,
      );
      const progress = 1 - remaining / focusStartTravel.current;
      if (progress >= focusPanelProgress.current || remaining < 1.2) {
        focusReadyNode.current = selectedRef.current;
        onFocusReadyChange?.(selectedRef.current);
      }
    }

    orbitAngle.current += ORBIT_SPEED * delta;
    const r = orbitRadius.current;
    const c = orbitCentre.current;
    camera.position.set(
      c.x + Math.cos(orbitAngle.current) * r,
      c.y + orbitHeight.current + Math.sin((t - bobT0.current) * 0.05) * 3,
      c.z + Math.sin(orbitAngle.current) * r,
    );
    _lookM.lookAt(camera.position, c, _up);
    _q.setFromRotationMatrix(_lookM);
    // Ease toward facing the centre, but never turn faster than MAX_TURN. The existing exp ease
    // smooths small corrections; the cap keeps a big swing (the "spins me fast" cases) to a steady,
    // normal rotation instead of a whip. ang = angle still to turn this frame.
    {
      const ease = 1 - Math.exp(-2.2 * delta);
      const ang = camera.quaternion.angleTo(_q);
      const step = Math.min(ang * ease, MAX_TURN * delta);
      camera.quaternion.slerp(_q, ang > 1e-6 ? step / ang : 1);
    }
    syncLook();

    // the grid counter-rotates only during the idle overview orbit
    if (selectedRef.current == null && gridRef.current) {
      gridRef.current.rotation.y -= GRID_SPEED * delta;
    }

    telemetry.x = camera.position.x;
    telemetry.y = camera.position.y;
    telemetry.z = camera.position.z;
    telemetry.speed = ORBIT_SPEED * r;
    runHover();
  });

  return null;
}
