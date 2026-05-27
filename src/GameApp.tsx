import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import InteractiveNetworkExplorer from './components/InteractiveNetworkExplorer';
import ExplorerHud from './components/ExplorerHud';
import Terminal from './components/Terminal';
import UpgradePanel from './components/UpgradePanel';
import PlayerSubnetworkPanel from './components/PlayerSubnetworkPanel';
import InterfaceSettingsPanel from './components/InterfaceSettingsPanel';
import Mission00Intro from './components/Mission00Intro';
import NevaCorePanel from './components/NevaCorePanel';
import PlaytestNotesPanel from './components/PlaytestNotesPanel';
import ProfilePanel from './components/ProfilePanel';
import CallsignPrompt from './components/CallsignPrompt';
import TouchControls from './components/TouchControls';
import { useIsTouch } from './useIsTouch';
import { gameReducer, initGame, gatewaysAtDepth, nodesOfType, traceTier, nodeType, recommendedAction, threatState, coreSecured, TUTORIAL_NODES, getCurrentObjectiveNodeId, objectiveKey, type NodeType, type GameState } from './game';
import { MISSION_META } from './missions';
import { resolveObjectiveTarget, objectiveSignalText, objectiveVisualKind } from './objectives';
import { buildNevaContext, askNevaCore, type NevaMode, type NevaResponse } from './nevaCore';
import { playSelect, playReturn, playPanelOpen, playPanelClose, setAudioMuted } from './audio';
import { devScanInfo } from './devscan';
import { terminalNav } from './terminalNav';
import { uiCapture } from './uiCapture';
import { type TerminalEffect } from './terminal';
import { NETWORK } from './network';
import { loadSave, writeSave, loadCheckpoint, writeCheckpoint, clearCheckpoint } from './save';
import { applyUiSettings, defaultUiSettings, loadUiSettings, saveUiSettings, type UiSettings } from './uiSettings';
import { capturePlaytestContext, checkpointSummary, loadPlaytestNotes, makeNote, savePlaytestNotes, clearStoredPlaytestNotes, type PlaytestCategory, type PlaytestNote } from './playtest';
import { loadProfile, writeProfile, clearProfile, createProfile, syncProfile, sanitizeCallsign, generateDefaultCallsign } from './profile';

/**
 * The interactive network explorer + interface-game. Mounted once the operator has
 * passed the landing page (App owns that gate). `onShowIntro` returns to the landing
 * without disturbing the autosave, so the run resumes on re-entry.
 */
export default function Game({ onShowIntro }: { onShowIntro: () => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [muted, setMuted] = useState(false);
  const [devScan, setDevScan] = useState(false); // developer node-type overlay — toggled with V (D is strafe-right)
  const [devNotice, setDevNotice] = useState<string | null>(null); // transient dev HUD line
  const [terminalOpen, setTerminalOpen] = useState(false); // NEVA command terminal (Space)
  const [terminalClosing, setTerminalClosing] = useState(false); // playing the retract animation
  const [terminalPinned, setTerminalPinned] = useState(false); // docked to the right edge (stays open while playing)
  const [scanOn, setScanOn] = useState(false); // `scan` kind-marker overlay
  const [upgradesOpen, setUpgradesOpen] = useState(false); // NEVA // UPGRADES panel (U)
  const [upgradesClosing, setUpgradesClosing] = useState(false); // playing the retract animation
  const [subnetOpen, setSubnetOpen] = useState(false); // NEVA // PLAYER SUBNETWORK panel (B / HOME node)
  const [subnetClosing, setSubnetClosing] = useState(false); // playing the retract animation
  const [settingsOpen, setSettingsOpen] = useState(false); // interface readability settings (,)
  const [settingsClosing, setSettingsClosing] = useState(false); // playing the retract animation
  const [uiSettings, setUiSettings] = useState(loadUiSettings);
  const [unlockToast, setUnlockToast] = useState(false); // transient PLAYER SUBNETWORK UNLOCKED banner
  const [transitionHint, setTransitionHint] = useState<string | null>(null); // brief "NEXT SIGNAL LOCATED" cue on an objective transition
  const [missionWarp, setMissionWarp] = useState(false); // brief light-speed "route shift" overlay on a major mission change
  const [coreSweep, setCoreSweep] = useState(false); // brief "core stabilization" sweep on a CORE / ALPHA CORE moment
  // NEVA Core Assistant v1 — advisory hint panel (backend OpenAI; read-only, never changes the game)
  const [nevaOpen, setNevaOpen] = useState(false);
  const [nevaLoading, setNevaLoading] = useState(false);
  const [nevaResp, setNevaResp] = useState<NevaResponse | null>(null);
  const [nevaMode, setNevaMode] = useState<NevaMode>('MISSION_HINT');
  const [nevaClosing, setNevaClosing] = useState(false); // playing the retract before unmount
  // Playtest Notes — local-only QA logger for the Mission 00 → 20 playthrough (P). Non-modal,
  // read-only with respect to the game (its own localStorage key; never touches the save).
  const [playtestOpen, setPlaytestOpen] = useState(false);
  const [playtestNotes, setPlaytestNotes] = useState<PlaytestNote[]>(loadPlaytestNotes);
  // Player Profile (Phase 7) — local operator identity, persisted in its OWN localStorage slot
  // (see profile.ts). Fully separate from the game save so a session reset keeps the identity.
  const [profile, setProfile] = useState(loadProfile);
  const [profileOpen, setProfileOpen] = useState(false); // NEVA // PLAYER PROFILE panel (L)
  const [profileClosing, setProfileClosing] = useState(false);
  const needsCallsign = profile === null; // first run with no local profile → CREATE CALLSIGN prompt
  const [guideNode, setGuideNode] = useState<number | null>(null); // Mission 00: node the camera gently FRAMES (no selection / no panel) until the player clicks it
  // resume a saved session if one exists (read once, lazily)
  const [saved] = useState(loadSave);
  const [game, dispatch] = useReducer(gameReducer, undefined, () => saved?.game ?? initGame());

  const [continued, setContinued] = useState(saved?.continued ?? false); // dismissed the complete overlay
  const isTouch = useIsTouch();

  // tag the root for touch-only / responsive CSS
  useEffect(() => {
    document.documentElement.classList.toggle('is-touch', isTouch);
  }, [isTouch]);

  // refs to the latest openSubnet (defined later) so HOME-node clicks can wait
  // for FlyCamera's focus-ready signal before opening the subnetwork panel.
  const openSubnetRef = useRef<() => void>(() => {});
  const pendingSubnetOpenRef = useRef<number | null>(null);

  // select a node (from FlyCamera's click) — play the select blip on a real hit and count
  // it toward the mission "inspect" objective (the reducer dedupes repeat inspects). The HOME
  // node opens the Player Subnetwork panel instead of the node inspection panel.
  const handleSelect = useCallback((i: number | null) => {
    const g = gameRef.current;
    // Mission 00 intro: only the revealed tutorial nodes (0..step) are selectable — the rest of
    // the network is hidden, so a stray ray on empty space never picks a concealed node.
    if (i != null && !g.networkRevealed && !TUTORIAL_NODES.slice(0, g.mission00.step + 1).includes(i)) return;
    setSelected(i);
    if (i == null) pendingSubnetOpenRef.current = null;
    if (i != null) {
      setGuideNode(null); // the player took the wheel — stop framing, let the click dive + open
      playSelect();
      const sub = g.playerSubnetwork;
      if (sub.unlocked && i === sub.homeNodeId) pendingSubnetOpenRef.current = i;
      else {
        pendingSubnetOpenRef.current = null;
        dispatch({ type: 'INSPECT', node: i });
      }
    }
  }, []);

  // hover follows the same intro reveal gate (no reticle on still-hidden network nodes)
  const handleHover = useCallback((i: number | null) => {
    const g = gameRef.current;
    if (i != null && !g.networkRevealed && !TUTORIAL_NODES.slice(0, g.mission00.step + 1).includes(i)) {
      setHovered(null);
      return;
    }
    setHovered(i);
  }, []);


  // keep the latest selection for the (stable) key listener
  const selRef = useRef<number | null>(selected);
  useEffect(() => {
    selRef.current = selected;
    if (selected == null) pendingSubnetOpenRef.current = null;
  }, [selected]);

  // latest game state for the (stable) key listener + callbacks — the canonical "latest value"
  // escape-hatch ref (read in event handlers / stable callbacks, written here each render).
  const gameRef = useRef(game);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability -- intentional latest-value ref sync
    gameRef.current = game;
  }, [game]);
  const continuedRef = useRef(continued);
  useEffect(() => {
    continuedRef.current = continued;
  }, [continued]);

  // --- autosave: throttled so continuous trace-decay ticks don't thrash localStorage,
  // but any real change (export / isolate / depth / mission) lands within ~1.5s ---
  const saveTimer = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (saveTimer.current != null) return; // a write is already queued for this window
    saveTimer.current = window.setTimeout(() => {
      saveTimer.current = undefined;
      writeSave(gameRef.current, continuedRef.current); // writes the LATEST state
    }, 1500);
  }, [game, continued]);

  // --- checkpoints: capture a SAFE milestone snapshot so a trace lock retries from the latest
  // checkpoint instead of restarting at Mission 01. Milestones: a mission start, reaching a
  // deeper layer, and detecting the next-depth route. (Mission-complete → Continue advances to
  // the next mission, whose MISSION_START captures; the final mission's Continue captures
  // explicitly in `continueNetwork`.) Writes a ref + a separate localStorage slot (with .bak),
  // and never captures a locked/failed state. ---
  const checkpoint = useRef<GameState | null>(loadCheckpoint());
  // a render-safe label of the latest checkpoint (the Playtest Notes panel reads this in render;
  // accessing the ref's .current during render is disallowed). Updated wherever the checkpoint changes.
  const [checkpointLabel, setCheckpointLabel] = useState(() => checkpointSummary(loadCheckpoint()));
  const cpPrev = useRef({
    missionStarted: game.missionStarted,
    depth: game.currentDepth,
    route: game.nextGatewayFound,
  });
  const captureCheckpoint = useCallback((g: GameState) => {
    if (g.locked) return;
    checkpoint.current = g;
    writeCheckpoint(g);
    setCheckpointLabel(checkpointSummary(g));
  }, []);
  useEffect(() => {
    const p = cpPrev.current;
    const milestone =
      (game.missionStarted && !p.missionStarted) || // mission 01/02/03 start
      game.currentDepth > p.depth || // reached Depth 02 / 03
      (game.nextGatewayFound && !p.route); // next-depth route detected
    cpPrev.current = {
      missionStarted: game.missionStarted,
      depth: game.currentDepth,
      route: game.nextGatewayFound,
    };
    if (milestone && !game.locked) captureCheckpoint(game);
  }, [game, captureCheckpoint]);

  // flush immediately when the tab is closing / hidden, so nothing is lost
  useEffect(() => {
    const flush = () => writeSave(gameRef.current, continuedRef.current);
    const onVis = () => {
      if (document.hidden) flush();
    };
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  // trace decay tick — paused while the settings panel is open (the game is frozen
  // behind it), so trace neither decays nor builds while you adjust the interface.
  useEffect(() => {
    if (settingsOpen) return;
    const id = window.setInterval(() => dispatch({ type: 'TICK', dt: 0.5 }), 500);
    return () => window.clearInterval(id);
  }, [settingsOpen]);

  // keep the audio engine's mute flag in sync with state (single source of truth)
  useEffect(() => {
    setAudioMuted(muted);
  }, [muted]);

  useEffect(() => {
    applyUiSettings(uiSettings);
    saveUiSettings(uiSettings);
  }, [uiSettings]);

  // while a MODAL terminal or the upgrade panel is open it owns the keyboard — the camera/game key
  // handlers stand down. A PINNED terminal is a docked HUD widget, so it releases the keyboard
  // (you keep flying/playing) — only typing in its input field captures keys.
  useEffect(() => {
    uiCapture.active =
      (terminalOpen && !terminalPinned) || upgradesOpen || subnetOpen || settingsOpen || profileOpen || needsCallsign;
  }, [terminalOpen, terminalPinned, upgradesOpen, subnetOpen, settingsOpen, profileOpen, needsCallsign]);

  // refs the (stable) capture-phase key listener reads
  const terminalOpenRef = useRef(terminalOpen);
  useEffect(() => {
    terminalOpenRef.current = terminalOpen;
  }, [terminalOpen]);
  const terminalPinnedRef = useRef(terminalPinned);
  useEffect(() => {
    terminalPinnedRef.current = terminalPinned;
  }, [terminalPinned]);
  const scanRef = useRef(scanOn);
  useEffect(() => {
    scanRef.current = scanOn;
  }, [scanOn]);
  const upgradesOpenRef = useRef(upgradesOpen);
  useEffect(() => {
    upgradesOpenRef.current = upgradesOpen;
  }, [upgradesOpen]);
  const subnetOpenRef = useRef(subnetOpen);
  useEffect(() => {
    subnetOpenRef.current = subnetOpen;
  }, [subnetOpen]);
  const settingsOpenRef = useRef(settingsOpen);
  useEffect(() => {
    settingsOpenRef.current = settingsOpen;
  }, [settingsOpen]);

  // ===================== CENTRALIZED OBJECTIVE / DEPTH TRANSITION =====================
  // One handler for EVERY objective change — Mission 00 tutorial steps, mission advances, and
  // depth changes. `objectiveKey(game)` (= missionId:step:depth) changes exactly once per
  // transition, so this runs ONCE per advance (never every frame) and never fights the player.
  // On a transition it CLEARS the stale node panel/selection and focuses the next objective node
  // (Mission 00 step) — or pulls back to the network overview when there's no single target
  // (mission advance, depth change, network reveal). It reuses the camera's existing focus mechanic:
  // `setSelected(node)` smoothly eases the orbit to that node (same glide as a click); `setSelected
  // (null)` runs the same smooth return-to-overview as R. R itself is unchanged. On the first run
  // (mount / reload) it focuses the current objective once with no message (save/load behaviour).
  const lastObjectiveKeyRef = useRef<string | null>(null);
  const prevTutorialCompleteRef = useRef(game.mission00.complete);
  const prevMissionIdRef = useRef(game.missionId); // detect MAJOR (mission-id) transitions vs depth/step
  const pendingMissionWarpRef = useRef(false); // a mission just advanced → run the cinematic on its BEGIN
  const transitionHintTimer = useRef<number | undefined>(undefined);
  const guideTimer = useRef<number | undefined>(undefined);
  const missionWarpTimer = useRef<number | undefined>(undefined);
  const FEEDBACK_DWELL_MS = 1600; // hold on the just-acted node so its success feedback reads
  const MISSION_WARP_MS = 1200; // light-speed "route shift" travel duration (900–1600ms cinematic)
  const key = objectiveKey(game);
  useEffect(() => {
    if (lastObjectiveKeyRef.current === key) return;
    const first = lastObjectiveKeyRef.current === null;
    lastObjectiveKeyRef.current = key;
    const g = gameRef.current;
    const target = getCurrentObjectiveNodeId(g);
    const wasComplete = prevTutorialCompleteRef.current;
    prevTutorialCompleteRef.current = g.mission00.complete;
    window.clearTimeout(guideTimer.current);
    // the node the player just acted on (still selected as this transition fires) — used to make
    // the dwell timers a no-op if the player has already grabbed a different node in the meantime.
    const completedNode = selRef.current;

    // Tutorial just finished (CORE synced): keep the CORE panel up so its feedback reads, THEN
    // release to the freshly-revealed network overview (the Mission 01 briefing takes over).
    if (g.mission00.complete && !wasComplete && !first) {
      setGuideNode(null);
      guideTimer.current = window.setTimeout(() => {
        if (selRef.current === completedNode) setSelected(null);
      }, FEEDBACK_DWELL_MS + 600);
      return;
    }

    // Post-tutorial objectives. Two distinct cases:
    //  • MAJOR transition (the mission id changed → MISSION_ADVANCE): do a CLEAN cinematic reset —
    //    close the old node's panels + clear selection NOW so the camera glides back to the neutral
    //    overview (FlyCamera's aimOverview), and ARM the warp so the visible "light-speed travel +
    //    focus the new objective" plays once the player BEGINS the next mission (not hidden behind
    //    the briefing). This fixes "stuck on the old node / panels stay open" generically (M00→01,
    //    M07→08 … M12→next + future Phase 3B).
    //  • MINOR transition (same mission, depth/step changed): focus the target node as before — the
    //    in-mission objective guidance is intentionally left untouched.
    if (g.mission00.complete) {
      setGuideNode(null);
      const missionChanged = !first && g.missionId !== prevMissionIdRef.current;
      prevMissionIdRef.current = g.missionId;
      if (missionChanged) {
        setSelected(null); // close Node Info + Node Inspection panels for the old objective node
        dispatch({ type: 'CLOSE_STREAM' }); // close any stream/action panel tied to the old node
        playReturn();
        pendingMissionWarpRef.current = true; // the cinematic + new-target focus run on BEGIN
        return;
      }
      setSelected(target);
      if (target != null) {
        playSelect();
        // Lead the player onto the objective node: mark it inspected (auto-focus bypasses
        // handleSelect/INSPECT, so "located" tasks would otherwise not stick) and flash a one-shot
        // cue naming the deep objective (CORE / VAULT / FIREWALL / CORRUPTION / RELAY / deep route).
        dispatch({ type: 'INSPECT', node: target });
        // metadata-driven "signal located" cue (see objectives.ts) — adding a mission no longer
        // means editing a per-id branch here.
        const cue = objectiveSignalText(g.missionId);
        if (cue) {
          setTransitionHint(cue);
          window.clearTimeout(transitionHintTimer.current);
          transitionHintTimer.current = window.setTimeout(() => setTransitionHint(null), 2200);
        }
      }
      return;
    }

    // Mission 00 — GUIDED + PACED. On mount/reload, gently FRAME the current step's node (the
    // player clicks it to begin); never auto-select, so the explanation beat is the player's.
    if (first) {
      setGuideNode(target);
      return;
    }
    // A step was just completed: the just-acted node is still `selected`, so its success feedback
    // stays on screen. Dwell, THEN close that panel and gently guide the camera to the next node —
    // feedback first, jump second (no more reward-and-teleport collision).
    guideTimer.current = window.setTimeout(() => {
      // if the player already moved to a different node during the dwell, don't override them
      if (selRef.current != null && selRef.current !== completedNode) return;
      setSelected(null);          // close the completed node's (now stale) panel
      setGuideNode(target);       // ease the camera to frame the next signal — no auto-open
      if (target != null) {
        setTransitionHint('NEXT SIGNAL LOCATED');
        window.clearTimeout(transitionHintTimer.current);
        transitionHintTimer.current = window.setTimeout(() => setTransitionHint(null), 1800);
      }
    }, FEEDBACK_DWELL_MS);
  }, [key]);

  // ===================== CINEMATIC MISSION TRANSITION (light-speed travel) =====================
  // Runs once when the player BEGINS a freshly-advanced mission (missionStarted false→true with the
  // warp armed by the handler above). The panels are already closed + the camera already pulled to
  // the neutral overview at advance-time, so HERE — with the briefing dismissed — we play the
  // visible part: a subtle light-speed "route shift" overlay + cue, then focus/highlight the new
  // objective target after the travel settles. Order: panels close → overview → new mission begins
  // → travel → new target highlights. Generic across all missions; respects player camera control.
  const prevStartedRef = useRef(game.missionStarted);
  useEffect(() => {
    const justBegan = game.missionStarted && !prevStartedRef.current;
    prevStartedRef.current = game.missionStarted;
    if (!justBegan || !game.mission00.complete || !pendingMissionWarpRef.current) return;
    pendingMissionWarpRef.current = false;
    setMissionWarp(true);
    setTransitionHint('ROUTE SHIFTING');
    window.clearTimeout(missionWarpTimer.current);
    window.clearTimeout(transitionHintTimer.current);
    missionWarpTimer.current = window.setTimeout(() => {
      setMissionWarp(false);
      // respect player control — only auto-focus the new target if the player hasn't grabbed a node
      // (or moved the camera into a selection) during the travel.
      const target = getCurrentObjectiveNodeId(gameRef.current);
      if (selRef.current == null) {
        setSelected(target);
        if (target != null) {
          playSelect();
          dispatch({ type: 'INSPECT', node: target });
        }
      }
      // "next signal locked" beat — the mission's own located cue, or a generic line
      const cue = objectiveSignalText(gameRef.current.missionId) ?? 'NEXT SIGNAL LOCKED';
      setTransitionHint(cue);
      window.clearTimeout(transitionHintTimer.current);
      transitionHintTimer.current = window.setTimeout(() => setTransitionHint(null), 2000);
    }, MISSION_WARP_MS);
  }, [game.missionStarted, game.mission00.complete]);

  // show the PLAYER SUBNETWORK UNLOCKED banner once, on the unlock transition (auto-dismisses)
  const subUnlockedRef = useRef(game.playerSubnetwork.unlocked);
  useEffect(() => {
    if (game.playerSubnetwork.unlocked && !subUnlockedRef.current) {
      setUnlockToast(true);
      window.setTimeout(() => setUnlockToast(false), 4200);
    }
    subUnlockedRef.current = game.playerSubnetwork.unlocked;
  }, [game.playerSubnetwork.unlocked]);

  // Phase 4 — CORE / ALPHA CORE moment: a brief screen-wide "stabilization sweep" the instant the
  // CORE is secured (M07), the ALPHA CORE is stabilized (M19), or Sector A02 is secured (M20). Each
  // is its OWN rising edge (so M20 still fires even though alphaCoreStabilized is already latched).
  // Refs init to the loaded values so a resumed save never flashes the sweep. Purely visual.
  const coreSecuredM7Ref = useRef(game.missionId === 7 && coreSecured(game));
  const alphaStabRef = useRef(game.alphaCoreStabilized);
  const sectorSecuredRef = useRef(game.sectorA02Secured);
  useEffect(() => {
    const core7 = game.missionId === 7 && coreSecured(game);
    const fire =
      (core7 && !coreSecuredM7Ref.current) ||
      (game.alphaCoreStabilized && !alphaStabRef.current) ||
      (game.sectorA02Secured && !sectorSecuredRef.current);
    coreSecuredM7Ref.current = core7;
    alphaStabRef.current = game.alphaCoreStabilized;
    sectorSecuredRef.current = game.sectorA02Secured;
    if (fire) {
      setCoreSweep(true);
      window.setTimeout(() => setCoreSweep(false), 1500);
    }
  }, [game]);

  // upgrades are a deliberate, infrequent purchase — flush the save immediately on change so a
  // refresh right after buying never loses it (the throttled autosave would lag up to ~1.5s)
  const upgradesRef = useRef(game.upgrades);
  useEffect(() => {
    if (game.upgrades !== upgradesRef.current) {
      upgradesRef.current = game.upgrades;
      writeSave(game, continued);
    }
  }, [game, continued]);

  // per-type cursor so repeated `go to <type>` cycles through nodes instead of re-picking the
  // one you're parked on. Reset on a depth change (the type assignment differs per layer).
  const gotoCursor = useRef<Partial<Record<NodeType, number>>>({});
  useEffect(() => {
    gotoCursor.current = {};
  }, [game.currentDepth]);

  // Mission 03 // SIGNAL WAR — the network emits signal pulses (network-wide pressure
  // events) every 25–45s. Each pulse lasts ~7s, then PULSE_END advances "survived". Timing
  // uses real time + Math.random here (side effect), keeping the reducer pure.
  const pulseRunning = game.missionId >= 3 && game.missionStarted && !game.missionComplete && !game.locked;
  useEffect(() => {
    if (!pulseRunning) return;
    let startId = 0;
    let endId = 0;
    const schedule = () => {
      const delay = 25000 + Math.random() * 20000; // 25–45s between pulses
      startId = window.setTimeout(() => {
        dispatch({ type: 'PULSE_START' });
        endId = window.setTimeout(() => {
          dispatch({ type: 'PULSE_END' });
          schedule();
        }, 7000); // pulse duration
      }, delay);
    };
    schedule();
    return () => {
      window.clearTimeout(startId);
      window.clearTimeout(endId);
      // if pulses stop (mission complete / lock) mid-pulse, clear the lingering pulse
      if (gameRef.current.pulseActive) dispatch({ type: 'PULSE_END' });
    };
  }, [pulseRunning]);

  // --- reset behaviour: three distinct paths, never one catch-all ---
  // R during normal play = soft "reset view": drop focus / panels / selection and
  // recenter the camera, but KEEP all progress (depth, trace, data, statuses).
  const resetView = useCallback(() => {
    pendingSubnetOpenRef.current = null;
    setSelected(null);
    dispatch({ type: 'CLOSE_STREAM' });
    playReturn();
  }, []);
  // Shift + R = full session reset: a brand-new clean session back at Depth 01. Mission
  // restarts too (RESET clears missionStarted/complete; re-show its overlays). The checkpoint
  // is wiped so a fresh run can't retry into the old progress.
  const resetSession = useCallback(() => {
    pendingSubnetOpenRef.current = null;
    setSelected(null);
    setContinued(false);
    checkpoint.current = null;
    clearCheckpoint();
    setCheckpointLabel('NONE');
    dispatch({ type: 'RESET' });
    playReturn();
  }, []);

  // RETRY FROM CHECKPOINT (trace-locked R): restore the latest safe milestone snapshot — keeps
  // mission/depth/completion progress; clears the lock and resets trace. If no checkpoint exists
  // yet, the reducer recovers in place (unlock + safe trace), never bouncing back to Mission 01.
  const retryCheckpoint = useCallback(() => {
    pendingSubnetOpenRef.current = null;
    setSelected(null);
    setContinued(false);
    dispatch({ type: 'LOAD_CHECKPOINT', checkpoint: checkpoint.current ?? loadCheckpoint() });
    playReturn();
  }, []);

  // mission overlay actions
  const beginMission = useCallback(() => dispatch({ type: 'MISSION_START' }), []);
  // CONTINUE NETWORK on a completion overlay: advance to the next mission while there is one
  // (keep the network state); the final mission just dismisses the overlay and keeps playing.
  // Either way this is a milestone — capture a checkpoint.
  const continueNetwork = useCallback(() => {
    if (gameRef.current.missionId < 20) dispatch({ type: 'MISSION_ADVANCE' });
    else setContinued(true);
    captureCheckpoint(gameRef.current);
  }, [captureCheckpoint]);

  // FOCUS OBJECTIVE (reusable fallback) — recenter on the current mission target without the
  // player hunting for it. Reuses the existing focus glide: setSelected(node) eases the orbit to
  // it (same as a click) and marks it inspected; if there is no single target it pulls to overview.
  // Never replaces normal guidance — it's a one-press "show me the objective" safety net.
  const focusObjective = useCallback(() => {
    const g = gameRef.current;
    const obj = resolveObjectiveTarget(g, selRef.current);
    const node = obj?.targetNodeId ?? null;
    setSelected(node);
    if (node != null) {
      playSelect();
      dispatch({ type: 'INSPECT', node });
    }
    setTransitionHint('OBJECTIVE FOCUS');
    window.clearTimeout(transitionHintTimer.current);
    transitionHintTimer.current = window.setTimeout(() => setTransitionHint(null), 1800);
  }, []);

  // --- NEVA terminal (Space opens it; ESC / `close` shut it) ---
  // Closing isn't instant: we flag `terminalClosing` to play the retract animation, then
  // unmount once it finishes. TERM_CLOSE_MS must match the CSS retract duration.
  const TERM_CLOSE_MS = 760;
  const closeTimer = useRef<number | undefined>(undefined);
  const closingRef = useRef(false); // a retract is in flight (guards repeat close calls)
  const openTerminal = useCallback(() => {
    if (document.pointerLockElement) document.exitPointerLock(); // free the mouse to type
    window.clearTimeout(closeTimer.current); // cancel any in-flight retract
    closingRef.current = false;
    setTerminalClosing(false);
    setTerminalOpen(true);
  }, []);
  const closeTerminal = useCallback(() => {
    if (closingRef.current) return; // already retracting — ignore repeat closes
    closingRef.current = true;
    setTerminalClosing(true);
    closeTimer.current = window.setTimeout(() => {
      setTerminalOpen(false);
      setTerminalClosing(false);
      setTerminalPinned(false); // a fresh open is always centred / modal
      closingRef.current = false;
    }, TERM_CLOSE_MS);
  }, []);
  // PIN: dock the terminal to the right edge (aligned with the Tasks panel) and keep it open
  // while you play. Pinning blurs the input so flight keys work immediately; unpinning returns it
  // to the centre (modal) and refocuses the prompt. The slide runs at the open-animation speed.
  const toggleTerminalPin = useCallback(() => {
    setTerminalPinned((p) => {
      const next = !p;
      if (next) (document.activeElement as HTMLElement | null)?.blur?.();
      else window.setTimeout(() => (document.querySelector('.term__input') as HTMLElement | null)?.focus(), 0);
      return next;
    });
  }, []);

  // --- NEVA upgrades panel: same staged open/close as the terminal (corners assemble/retract).
  // UP_CLOSE_MS must match the CSS retract duration (.up--closing). ---
  const UP_CLOSE_MS = 760;
  const upCloseTimer = useRef<number | undefined>(undefined);
  const upClosingRef = useRef(false);
  const openUpgrades = useCallback(() => {
    window.clearTimeout(upCloseTimer.current);
    upClosingRef.current = false;
    setUpgradesClosing(false);
    playPanelOpen();
    setUpgradesOpen(true);
  }, []);
  const closeUpgrades = useCallback(() => {
    if (upClosingRef.current) return; // already retracting
    upClosingRef.current = true;
    playPanelClose(); // reversed open cue — the sonic opposite, for the retract
    setUpgradesClosing(true);
    upCloseTimer.current = window.setTimeout(() => {
      setUpgradesOpen(false);
      setUpgradesClosing(false);
      upClosingRef.current = false;
    }, UP_CLOSE_MS);
  }, []);

  // --- NEVA Player Subnetwork panel (B, or selecting the HOME node): same staged open/close.
  // Opening it closes the upgrade panel (one modal at a time). ---
  const SUB_CLOSE_MS = 760;
  const subCloseTimer = useRef<number | undefined>(undefined);
  const subClosingRef = useRef(false);
  const openSubnet = useCallback(() => {
    if (!gameRef.current.playerSubnetwork.unlocked) return; // grid not unlocked yet
    window.clearTimeout(subCloseTimer.current);
    subClosingRef.current = false;
    setSubnetClosing(false);
    setUpgradesOpen(false); // never two modals at once
    setSubnetOpen(true);
  }, []);
  const closeSubnet = useCallback(() => {
    if (subClosingRef.current) return; // already retracting
    subClosingRef.current = true;
    setSubnetClosing(true);
    subCloseTimer.current = window.setTimeout(() => {
      setSubnetOpen(false);
      setSubnetClosing(false);
      subClosingRef.current = false;
    }, SUB_CLOSE_MS);
  }, []);
  useEffect(() => { openSubnetRef.current = openSubnet; }, [openSubnet]);
  const handleFocusReadyChange = useCallback((i: number | null) => {
    if (i == null || pendingSubnetOpenRef.current !== i) return;
    const sub = gameRef.current.playerSubnetwork;
    if (sub.unlocked && i === sub.homeNodeId) {
      pendingSubnetOpenRef.current = null;
      openSubnetRef.current();
    }
  }, []);

  // --- Interface settings panel: readability only, no gameplay state. ---
  const SETTINGS_CLOSE_MS = 760;
  const settingsCloseTimer = useRef<number | undefined>(undefined);
  const settingsClosingRef = useRef(false);
  const openSettings = useCallback(() => {
    if (document.pointerLockElement) document.exitPointerLock();
    window.clearTimeout(settingsCloseTimer.current);
    settingsClosingRef.current = false;
    setSettingsClosing(false);
    setSettingsOpen(true);
  }, []);
  const closeSettings = useCallback(() => {
    if (settingsClosingRef.current) return;
    settingsClosingRef.current = true;
    setSettingsClosing(true);
    settingsCloseTimer.current = window.setTimeout(() => {
      setSettingsOpen(false);
      setSettingsClosing(false);
      settingsClosingRef.current = false;
    }, SETTINGS_CLOSE_MS);
  }, []);
  const resetUiSettings = useCallback(() => {
    setUiSettings(defaultUiSettings());
  }, []);
  const updateUiSettings = useCallback((next: UiSettings) => {
    setUiSettings(next);
  }, []);

  // --- NEVA Core Assistant v1 (advisory only) ---
  // Reads the latest game state (refs), builds a compact safe context, asks the backend, shows the
  // hint. It NEVER dispatches a game action / changes state. Falls back deterministically if the
  // AI route is offline. Gated to post-tutorial so it doesn't clutter onboarding.
  const devScanRef = useRef(devScan);
  useEffect(() => { devScanRef.current = devScan; }, [devScan]);
  const nevaOpenRef = useRef(nevaOpen);
  useEffect(() => { nevaOpenRef.current = nevaOpen; }, [nevaOpen]);
  const nevaReqId = useRef(0);
  const askNeva = useCallback(async (mode: NevaMode, question?: string) => {
    setNevaMode(mode);
    setNevaLoading(true);
    const id = ++nevaReqId.current;
    const ctx = buildNevaContext(gameRef.current, selRef.current, devScanRef.current);
    const r = await askNevaCore(ctx, mode, question);
    if (id !== nevaReqId.current) return; // superseded by a newer request
    setNevaResp(r);
    setNevaLoading(false);
  }, []);
  // open/close with the same staged assemble/retract as the other panels: closing plays the retract
  // (corners combine + surface scales out) before unmounting. NEVA_CLOSE_MS must clear the CSS retract.
  const NEVA_CLOSE_MS = 640;
  const nevaCloseTimer = useRef<number | undefined>(undefined);
  const nevaClosingRef = useRef(false);
  const openNeva = useCallback(() => {
    window.clearTimeout(nevaCloseTimer.current); // cancel any in-flight retract → re-open instantly
    nevaClosingRef.current = false;
    setNevaClosing(false);
    setNevaOpen(true);
    askNeva(selRef.current != null ? 'NODE_EXPLAIN' : 'MISSION_HINT');
  }, [askNeva]);
  const closeNeva = useCallback(() => {
    if (nevaClosingRef.current) return; // already retracting
    nevaClosingRef.current = true;
    setNevaClosing(true);
    nevaCloseTimer.current = window.setTimeout(() => {
      setNevaOpen(false);
      setNevaClosing(false);
      nevaClosingRef.current = false;
    }, NEVA_CLOSE_MS);
  }, []);
  const toggleNeva = useCallback(() => {
    if (!gameRef.current.mission00.complete) return; // not during the guided intro
    if (nevaOpenRef.current && !nevaClosingRef.current) closeNeva();
    else openNeva(); // open, or re-open if mid-retract
  }, [openNeva, closeNeva]);

  // --- Playtest Notes (QA logger) — local-only, advisory; NEVER mutates game / save / backend.
  // A note snapshots the live context (mission/objective/depth/sector/trace/node/resources/
  // checkpoint) at click time and persists to its own localStorage key. ---
  const togglePlaytest = useCallback(() => setPlaytestOpen((v) => !v), []);
  const addPlaytestNote = useCallback((category: PlaytestCategory, message: string) => {
    const ctx = capturePlaytestContext(gameRef.current, selRef.current, checkpointSummary(checkpoint.current));
    setPlaytestNotes((prev) => {
      const next = [makeNote(category, message, ctx), ...prev];
      savePlaytestNotes(next);
      return next;
    });
  }, []);
  const clearPlaytestNotesAll = useCallback(() => {
    if (typeof window !== 'undefined' && !window.confirm('CLEAR ALL PLAYTEST NOTES?')) return;
    setPlaytestNotes([]);
    clearStoredPlaytestNotes();
  }, []);

  // ============================ PLAYER PROFILE (Phase 7) ============================
  // A LOCAL-FIRST operator identity layer in its OWN localStorage slot (profile.ts), fully
  // separate from the game save/checkpoint — so Shift+R (RESET), checkpoint retry, and soft-R all
  // keep the identity, and the pure reducer / save schema stay untouched. The profile is a
  // high-water-mark snapshot of progression (+ achievements); it NEVER changes gameplay.
  const profileRef = useRef(profile);
  useEffect(() => { profileRef.current = profile; }, [profile]);
  const profileOpenRef = useRef(profileOpen);
  useEffect(() => { profileOpenRef.current = profileOpen; }, [profileOpen]);
  const needsCallsignRef = useRef(needsCallsign);
  useEffect(() => { needsCallsignRef.current = needsCallsign; }, [needsCallsign]);

  // Fold the live game state into the profile on every change: raise the high-water marks, count a
  // fresh trace lock, and unlock newly-earned achievements. syncProfile returns the SAME ref when
  // nothing changed, so idle decay ticks never write. Edge events (a fresh trace lock / a mission
  // completed below 50% trace) are detected here from successive states (the profile can't see them).
  const prevLockedRef = useRef(game.locked);
  const prevMissionCompleteRef = useRef(game.missionComplete);
  useEffect(() => {
    const lockedEdge = game.locked && !prevLockedRef.current;
    const completeEdge = game.missionComplete && !prevMissionCompleteRef.current;
    prevLockedRef.current = game.locked;
    prevMissionCompleteRef.current = game.missionComplete;
    const p = profileRef.current;
    if (!p) return; // no identity yet (callsign prompt up) — nothing to sync
    const next = syncProfile(p, game, {
      traceLockedEdge: lockedEdge,
      cleanCompleteEdge: completeEdge && game.traceLevel < 50,
    });
    if (next !== p) {
      setProfile(next);
      writeProfile(next);
    }
  }, [game]);

  // CREATE CALLSIGN — build the local profile (a sanitized callsign, or an OPERATOR-XXXX default on
  // skip), then immediately fold in the current run's progress so an existing save shows at once.
  const createCallsign = useCallback((raw: string | null) => {
    const name = (raw != null && sanitizeCallsign(raw)) || generateDefaultCallsign();
    const fresh = createProfile(name);
    const synced = syncProfile(fresh, gameRef.current, { traceLockedEdge: false, cleanCompleteEdge: false });
    const final = synced === fresh ? fresh : synced;
    setProfile(final);
    writeProfile(final);
  }, []);

  // PLAYER PROFILE panel open/close (modal — one modal at a time, like UPGRADES / SUBNETWORK).
  const PROFILE_CLOSE_MS = 640;
  const profileCloseTimer = useRef<number | undefined>(undefined);
  const profileClosingRef = useRef(false);
  const openProfile = useCallback(() => {
    if (!profileRef.current) return; // no identity yet
    window.clearTimeout(profileCloseTimer.current);
    profileClosingRef.current = false;
    setProfileClosing(false);
    setUpgradesOpen(false);
    setSubnetOpen(false); // never two modals at once
    playPanelOpen();
    setProfileOpen(true);
  }, []);
  const closeProfile = useCallback(() => {
    if (profileClosingRef.current) return; // already retracting
    profileClosingRef.current = true;
    playPanelClose();
    setProfileClosing(true);
    profileCloseTimer.current = window.setTimeout(() => {
      setProfileOpen(false);
      setProfileClosing(false);
      profileClosingRef.current = false;
    }, PROFILE_CLOSE_MS);
  }, []);
  // RESET PROFILE (from inside the panel, after a confirm): clear the LOCAL identity ONLY — the
  // gameplay save/checkpoint are untouched — then re-show the callsign prompt for a fresh identity.
  const handleResetProfile = useCallback(() => {
    window.clearTimeout(profileCloseTimer.current);
    profileClosingRef.current = false;
    setProfileClosing(false);
    setProfileOpen(false);
    clearProfile();
    setProfile(null);
  }, []);

  // carry out a terminal command's world/game effect; returns extra result lines to print
  const runTerminalEffect = useCallback(
    (effect: TerminalEffect): string[] => {
      if (effect.kind === 'scan') {
        const on = effect.mode === 'toggle' ? !scanRef.current : effect.mode === 'on';
        setScanOn(on);
        return [on ? '▸ SCAN ONLINE · KIND MARKERS ACTIVE' : '▸ SCAN OFFLINE'];
      }
      if (effect.kind === 'finishMission') {
        // DEV: latch the current mission complete so the completion overlay appears and you
        // can CONTINUE NETWORK to the next one without grinding every task.
        const g = gameRef.current;
        if (g.missionComplete) return ['▸ MISSION ALREADY COMPLETE · CONTINUE NETWORK'];
        dispatch({ type: 'FORCE_COMPLETE' });
        const id = String(g.missionId).padStart(2, '0');
        const nextLine =
          g.missionId < 20 ? '  CONTINUE NETWORK → NEXT MISSION' : '  FINAL MISSION · KEEP PLAYING';
        return [`▸ MISSION ${id} FORCE-COMPLETED (DEV)`, nextLine];
      }
      if (effect.kind !== 'goto') return []; // clear / close are handled in the component
      // goto: cycle through the nodes of this type so repeats visit a DIFFERENT one. First
      // call for a type → the nearest; each repeat → the next in the list (wrapping).
      const list = nodesOfType(effect.type, gameRef.current.currentDepth);
      if (list.length === 0) return [`▸ NO ${effect.type} NODE IN RANGE`];
      let idx: number;
      if (gotoCursor.current[effect.type] == null) {
        const r = terminalNav.nearestOfType(effect.type); // start at the nearest one
        idx = r.id >= 0 ? Math.max(0, list.indexOf(r.id)) : 0;
      } else {
        idx = (gotoCursor.current[effect.type]! + 1) % list.length;
      }
      gotoCursor.current[effect.type] = idx;
      const id = list[idx];
      handleSelect(id);
      const n = String(idx + 1).padStart(2, '0');
      const total = String(list.length).padStart(2, '0');
      return [`▸ ROUTING → ${effect.type} ${n}/${total}`, `  NODE ${NETWORK.meta[id].id}`];
    },
    [handleSelect],
  );

  // brief dev-only HUD notice (e.g. "NO GATEWAY FOUND IN CURRENT DEPTH")
  const noticeTimer = useRef<number | undefined>(undefined);
  const showDevNotice = useCallback((msg: string) => {
    setDevNotice(msg);
    window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setDevNotice(null), 2200);
  }, []);

  // G = focus nearest gateway · Shift+G / Alt+G = cycle next / previous gateway
  const devGwCursor = useRef(0);
  const focusGateway = useCallback(
    (mode: 'nearest' | 'next' | 'prev') => {
      const list = gatewaysAtDepth(gameRef.current.currentDepth);
      if (list.length === 0) {
        showDevNotice('NO GATEWAY FOUND IN CURRENT DEPTH');
        return;
      }
      let id: number;
      if (mode === 'next') {
        devGwCursor.current = (devGwCursor.current + 1) % list.length;
        id = list[devGwCursor.current];
      } else if (mode === 'prev') {
        devGwCursor.current = (devGwCursor.current - 1 + list.length) % list.length;
        id = list[devGwCursor.current];
      } else {
        id = devScanInfo.nearestId >= 0 ? devScanInfo.nearestId : list[0];
        devGwCursor.current = Math.max(0, list.indexOf(id));
      }
      handleSelect(id);
    },
    [handleSelect, showDevNotice],
  );

  // action shortcuts. O / T / I / E act on the selected node. R = reset view (soft) ·
  // Shift+R = reset session · locked R = reset session. G = nearest gateway. (D is left to
  // FlyCamera as strafe-right — it is no longer a dev-scan toggle.)
  // Registered in the CAPTURE phase to own Space / Esc before the camera sees them.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // typing in the terminal's input field always belongs to the terminal — its own onKeyDown
      // handles Enter / Esc / empty-Space. Never let those keystrokes drive flight or hotkeys.
      if ((e.target as HTMLElement | null)?.classList?.contains('term__input')) return;
      // Playtest Notes is a non-modal docked overlay — when focus is inside it (its input,
      // select, or buttons), let the panel own the keystroke instead of flying / firing hotkeys.
      if ((e.target as HTMLElement | null)?.closest?.('.pt')) return;
      // First-run CREATE CALLSIGN prompt owns the keyboard (typing into its field) — stand down so
      // letters reach the input and flight/hotkeys don't fire. The prompt handles Enter itself.
      if (needsCallsignRef.current) return;

      // terminal open: ESC always closes it. A MODAL (centred) terminal owns the whole keyboard;
      // a PINNED (docked) terminal only grabs Space (refocus its prompt) and lets every other key
      // fall through to normal flight / hotkeys so you can keep playing while it's docked.
      if (terminalOpenRef.current) {
        if (e.code === 'Escape') {
          e.preventDefault();
          e.stopImmediatePropagation();
          closeTerminal();
          return;
        }
        if (!terminalPinnedRef.current) return; // modal: swallow everything else (goes to input)
        if (e.code === 'Space') {
          e.preventDefault();
          e.stopImmediatePropagation();
          if (!e.repeat) (document.querySelector('.term__input') as HTMLElement | null)?.focus();
          return;
        }
        // pinned + not typing → fall through to the game/flight handlers below
      }
      // while the UPGRADES panel is open it owns input — only U / Esc (close) here.
      if (upgradesOpenRef.current) {
        if (e.code === 'KeyU' || e.code === 'Escape') {
          e.preventDefault();
          e.stopImmediatePropagation();
          if (!e.repeat) closeUpgrades();
        }
        return;
      }
      // while the PLAYER SUBNETWORK panel is open it owns input — only B / Esc (close) here.
      if (subnetOpenRef.current) {
        if (e.code === 'KeyB' || e.code === 'Escape') {
          e.preventDefault();
          e.stopImmediatePropagation();
          if (!e.repeat) closeSubnet();
        }
        return;
      }
      // while the INTERFACE SETTINGS panel is open it owns input — only comma / Esc close here.
      if (settingsOpenRef.current) {
        if (e.code === 'Comma' || e.code === 'Escape') {
          e.preventDefault();
          e.stopImmediatePropagation();
          if (!e.repeat) closeSettings();
        }
        return;
      }
      // while the PLAYER PROFILE panel is open it owns input — only L / Esc (close) here.
      if (profileOpenRef.current) {
        if (e.code === 'KeyL' || e.code === 'Escape') {
          e.preventDefault();
          e.stopImmediatePropagation();
          if (!e.repeat) closeProfile();
        }
        return;
      }
      // SPACE opens the terminal (it no longer flies). Consume so it never reaches the camera.
      if (e.code === 'Space') {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (!e.repeat) openTerminal();
        return;
      }
      // U opens the UPGRADES panel.
      if (e.code === 'KeyU') {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (!e.repeat) openUpgrades();
        return;
      }
      // B opens the PLAYER SUBNETWORK panel (only once unlocked, after Mission 03).
      if (e.code === 'KeyB') {
        if (gameRef.current.playerSubnetwork.unlocked) {
          e.preventDefault();
          e.stopImmediatePropagation();
          if (!e.repeat) openSubnet();
          return;
        }
      }
      // Comma opens INTERFACE SETTINGS. S is movement, so it stays free for flight.
      if (e.code === 'Comma') {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (!e.repeat) openSettings();
        return;
      }
      // KeyD is intentionally NOT handled here — it falls through to FlyCamera as the strafe-RIGHT
      // key (WASD). Dev Scan lives on V instead (consumed so it never reaches flight / focus).
      if (e.code === 'KeyV') {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (!e.repeat) setDevScan((prev) => !prev);
        return;
      }
      // N = toggle NEVA Core (advisory tactical hint). Consumed so it never reaches flight.
      if (e.code === 'KeyN') {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (!e.repeat) toggleNeva();
        return;
      }
      // P = toggle PLAYTEST NOTES (local QA logger). Consumed so it never reaches flight.
      if (e.code === 'KeyP') {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (!e.repeat) togglePlaytest();
        return;
      }
      // L = open PLAYER PROFILE (post-tutorial, once a local identity exists). Consumed so it never flies.
      if (e.code === 'KeyL') {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (!e.repeat && profileRef.current && gameRef.current.mission00.complete) openProfile();
        return;
      }
      if (e.code === 'KeyG') {
        focusGateway(e.shiftKey ? 'next' : e.altKey ? 'prev' : 'nearest');
        return;
      }
      if (e.code === 'Enter' || e.code === 'NumpadEnter') {
        // Mission 00 intro running → Enter does nothing; the player learns by acting on the real
        // node panel (EXTRACT / TRACE / ISOLATE / USE KEY / OPEN STREAM) or by clicking the node.
        if (!gameRef.current.mission00.complete) {
          e.preventDefault();
          return;
        }
        // mission briefing still up → Enter begins the mission
        if (!gameRef.current.missionStarted) {
          beginMission();
          return;
        }
        // otherwise Enter EXECUTES THE ORDER — the panel's recommended action on the selected
        // node (so you can act without reaching for O/T/I/E). Maps the recommendation text to the
        // matching action; GATEWAY opens the stream, or descends if its stream is already open.
        const n = selRef.current;
        if (n == null) return;
        e.preventDefault();
        const g = gameRef.current;
        const type = nodeType(n, g.currentDepth);
        if (type === 'GATEWAY') {
          dispatch(g.streamNode === n ? { type: 'ENTER_SUB', node: n } : { type: 'OPEN_STREAM', node: n });
          return;
        }
        const isWatcher = g.missionId >= 3 && type === 'CAMERA';
        const order = isWatcher ? 'ISOLATE' : recommendedAction(type, g.currentDepth);
        if (order.includes('OPEN STREAM')) dispatch({ type: 'OPEN_STREAM', node: n });
        else if (/ISOLATE|AVOID|DO NOT/.test(order)) dispatch({ type: 'ISOLATE', node: n });
        else if (order.includes('TRACE')) dispatch({ type: 'TRACE', node: n });
        else dispatch({ type: 'EXPORT', node: n });
        return;
      }
      if (e.code === 'KeyM') {
        setMuted((prev) => !prev);
        return;
      }
      if (e.code === 'KeyR') {
        if (gameRef.current.locked) {
          // trace locked: R = retry from latest checkpoint, Shift+R = full reset to Mission 01
          if (e.shiftKey) resetSession();
          else retryCheckpoint();
        } else if (e.shiftKey) resetSession();
        else resetView();
        return;
      }
      const n = selRef.current;
      if (n == null) return;
      if (e.code === 'KeyO') dispatch({ type: 'OPEN_STREAM', node: n });
      else if (e.code === 'KeyT') dispatch({ type: 'TRACE', node: n });
      else if (e.code === 'KeyI') dispatch({ type: 'ISOLATE', node: n });
      else if (e.code === 'KeyE') dispatch({ type: 'EXPORT', node: n });
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [resetView, resetSession, retryCheckpoint, focusGateway, beginMission, openTerminal, closeTerminal, openUpgrades, closeUpgrades, openSubnet, closeSubnet, openSettings, closeSettings, toggleNeva, togglePlaytest, openProfile, closeProfile]);

  // briefing + completion overlay copy per mission — centralized in missions.ts (MISSION_META)
  const mx = MISSION_META[game.missionId] ?? MISSION_META[1];

  // in-world objective marker — a subtle pulse on the current target whenever it is revealed
  // (status 'available') but NOT the node already selected (the selection frame covers that one)
  // and not during the Mission 00 intro (its guided light-path handles framing). Reusable.
  const objTarget = game.mission00.complete ? resolveObjectiveTarget(game, selected) : null;
  const objectiveMarkerNode =
    objTarget && objTarget.status === 'available' && objTarget.targetNodeId != null && objTarget.targetNodeId !== selected
      ? objTarget.targetNodeId
      : null;
  // visual category for the marker (Phase 4) — DATA / FIREWALL / CORRUPTION / RELAY / CORE accent.
  const objectiveKind = objectiveVisualKind(objTarget);

  // Sector A02 finale: completing the FINAL mission (20 // SECTOR A02 SECURED) shows a one-screen
  // summary (continued free play still allowed via CONTINUE NETWORK). Missions 12–19 now advance
  // onward, so the summary is gated to the true arc finale (Mission 20).
  const prototypeDone = game.missionId >= 20 && game.missionComplete;
  const securedCount = Object.values(game.statuses).filter(
    (st) => st && (st.extracted || st.isolated || st.unlocked),
  ).length;
  const modsInstalled = (Object.values(game.playerSubnetwork.modules) as number[]).filter((l) => l > 0).length;
  const modLevels = (Object.values(game.playerSubnetwork.modules) as number[]).reduce((a, b) => a + b, 0);

  return (
    <>
      <InteractiveNetworkExplorer
        selected={selected}
        hovered={hovered}
        game={game}
        dispatch={dispatch}
        onSelect={handleSelect}
        onHoverChange={handleHover}
        onLockChange={setLocked}
        onFocusReadyChange={handleFocusReadyChange}
        guideNode={guideNode}
        objectiveNode={objectiveMarkerNode}
        objectiveKind={objectiveKind}
        devScan={devScan}
        scanOn={scanOn}
        backgroundNoise={uiSettings.backgroundNoise}
      />
      <ExplorerHud
        selected={selected}
        locked={locked}
        game={game}
        devNotice={devNotice}
        settingsOpen={settingsOpen}
        onOpenSettings={openSettings}
        onRetryCheckpoint={retryCheckpoint}
        onResetSession={resetSession}
        onFocusObjective={focusObjective}
      />

      {/* discreet return to the landing page (resumes the run on re-entry) */}
      <button className="hud__intro" onClick={onShowIntro} type="button" title="Exit to landing page">
        ⏏ EXIT
      </button>

      {/* NEVA Core Assistant — small launcher (post-tutorial) + advisory hint panel (N). Read-only. */}
      {game.mission00.complete && !nevaOpen && (
        <button className="neva-launch" type="button" onClick={toggleNeva} title="Ask NEVA Core (N)">
          ◈ NEVA CORE <kbd>N</kbd>
        </button>
      )}
      {nevaOpen && (
        <NevaCorePanel
          loading={nevaLoading}
          response={nevaResp}
          mode={nevaMode}
          closing={nevaClosing}
          onMode={askNeva}
          onClose={closeNeva}
        />
      )}

      {/* PLAYER PROFILE — small launcher (post-tutorial, once a local identity exists) + panel (L). */}
      {game.mission00.complete && profile && !profileOpen && (
        <button className="pf-launch" type="button" onClick={openProfile} title="Player Profile (L)">
          ◇ PROFILE <kbd>L</kbd>
        </button>
      )}

      {/* Playtest Notes — local-only QA logger (toggle with P). Non-modal; never changes the game. */}
      {playtestOpen && (
        <PlaytestNotesPanel
          game={game}
          selected={selected}
          checkpointLabel={checkpointLabel}
          notes={playtestNotes}
          onAddNote={addPlaytestNote}
          onClear={clearPlaytestNotesAll}
          onClose={togglePlaytest}
        />
      )}

      {isTouch && <TouchControls onResume={() => setSelected(null)} />}

      {/* NEVA command terminal — opened with Space */}
      {terminalOpen && (
        <Terminal
          onClose={closeTerminal}
          runEffect={runTerminalEffect}
          closing={terminalClosing}
          traceTier={traceTier(game.traceLevel)}
          pinned={terminalPinned}
          onTogglePin={toggleTerminalPin}
        />
      )}

      {/* NEVA upgrades panel — opened with U (or the HUD UPGRADES button) */}
      {upgradesOpen && (
        <UpgradePanel game={game} dispatch={dispatch} onClose={closeUpgrades} closing={upgradesClosing} />
      )}

      {/* NEVA Player Subnetwork panel — opened with B (or selecting the HOME node) */}
      {subnetOpen && (
        <PlayerSubnetworkPanel game={game} dispatch={dispatch} onClose={closeSubnet} closing={subnetClosing} />
      )}

      {settingsOpen && (
        <InterfaceSettingsPanel
          settings={uiSettings}
          onChange={updateUiSettings}
          onReset={resetUiSettings}
          onClose={closeSettings}
          closing={settingsClosing}
        />
      )}

      {/* NEVA // PLAYER PROFILE — local operator identity (L). Read-only summary; RESET PROFILE only. */}
      {profileOpen && profile && (
        <ProfilePanel
          game={game}
          profile={profile}
          closing={profileClosing}
          onClose={closeProfile}
          onResetProfile={handleResetProfile}
        />
      )}

      {/* First-run CREATE CALLSIGN prompt (local only — no email / account). Skipping → OPERATOR-XXXX. */}
      {needsCallsign && <CallsignPrompt onSubmit={createCallsign} />}

      {/* one-time PLAYER SUBNETWORK UNLOCKED banner (auto-dismisses) */}
      {unlockToast && (
        <div className="subnet-toast">
          <div className="subnet-toast__t">PLAYER SUBNETWORK UNLOCKED</div>
          <div className="subnet-toast__s">PRIVATE GRID ACCESS GRANTED</div>
        </div>
      )}

      {/* light-speed "route shift" travel overlay — a subtle radial streak/flash played once on a
          major mission change (its duration must match MISSION_WARP_MS). Peripheral streaks, clear
          centre, pointer-events none; hidden under prefers-reduced-motion (see styles.css). */}
      {missionWarp && <div className="mission-warp" aria-hidden />}

      {/* CORE / ALPHA CORE stabilization sweep — a brief screen-wide "system online" line + glow */}
      {coreSweep && <div className="core-sweep" aria-hidden />}

      {/* brief objective-transition cue ("NEXT SIGNAL LOCATED") — the camera is guiding to the next node */}
      {transitionHint && <div className="transition-hint" key={transitionHint}>▸ {transitionHint}</div>}

      {/* Mission 00 — guided onboarding bar (replaces the mission/tasks panel until complete) */}
      {!game.mission00.complete && (
        <Mission00Intro game={game} selected={selected} objectiveNode={getCurrentObjectiveNodeId(game)} />
      )}

      {/* Mission 00 complete → the network reveal hand-off into Mission 01 */}
      {game.mission00.complete && !game.missionStarted && (
        <div className="mx" onClick={beginMission}>
          <div className="mx__box">
            <div className="mx__brand">NEVA NETWORK</div>
            <div className="mx__title">MISSION 00 COMPLETE</div>
            <div className="mx__sub">FIRST SIGNAL ACQUIRED</div>
            <div className="mx__rule" />
            <div className="mx__sub">PRIVATE NETWORK DETECTED · GRID EXPANDING</div>
            <div className="mx__sub">MISSION 01 UNLOCKED</div>
            <div className="mx__rule" />
            <button className="mx__go" onClick={(e) => { e.stopPropagation(); beginMission(); }}>
              ENTER THE NETWORK
            </button>
          </div>
        </div>
      )}

      {/* mission briefing — cinematic, monochrome; click or Enter to begin. Mission 01's intro is
          the Mission 00 onboarding above, so the standalone briefing is only for missions 02–07. */}
      {!game.missionStarted && game.missionId >= 2 && (
        <div className="mx" onClick={beginMission}>
          <div className="mx__box">
            {mx.brand && <div className="mx__brand">NEVA NETWORK</div>}
            <div className="mx__title">{mx.title}</div>
            {mx.sub?.map((s) => <div className="mx__sub" key={s}>{s}</div>)}
            <div className="mx__rule" />
            <div className="mx__label">OBJECTIVE</div>
            <ul className="mx__list">{mx.obj.map((o) => <li key={o}>{o}</li>)}</ul>
            <button className="mx__go" onClick={(e) => { e.stopPropagation(); beginMission(); }}>
              CLICK OR PRESS ENTER TO {game.missionId >= 2 ? 'CONTINUE' : 'BEGIN'}
            </button>
          </div>
        </div>
      )}

      {/* mission complete — never forces a stop. The final mission shows the PROTOTYPE v1 summary. */}
      {game.missionComplete && !continued && (
        <div className={`mx${prototypeDone ? ' mx--finale' : ''}`}>
          <div className="mx__box">
            {prototypeDone ? (
              <>
                <div className="mx__brand">NEVA NETWORK</div>
                <div className="mx__title">SECTOR A02 SECURED</div>
                <div className="mx__sub">ALPHA CORE ONLINE</div>
                <div className="mx__sub">NEXT SECTOR LOCKED</div>
                <div className="mx__rule" />
                <div className="mx__sub">DATA EXTRACTED · {game.extractedData}</div>
                <div className="mx__sub">CORE FRAGMENTS · {game.resources.coreFragments}</div>
                <div className="mx__sub">NODES SECURED · {securedCount}</div>
                <div className="mx__sub">MODULES · {modsInstalled}/4 · LV {modLevels}</div>
                <div className="mx__sub">FINAL THREAT · {threatState(game.traceLevel)}</div>
              </>
            ) : (
              <>
                <div className="mx__title">{mx.done[0]}</div>
                {mx.done.slice(1).map((s) => <div className="mx__sub" key={s}>{s}</div>)}
              </>
            )}
            <div className="mx__rule" />
            <div className="mx__actions">
              <button className="mx__go" onClick={continueNetwork}>CONTINUE NETWORK</button>
              <button className="mx__alt" onClick={resetSession}>RESET SESSION</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
