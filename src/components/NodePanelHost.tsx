import { useEffect, useRef, useState } from 'react';
import HolographicNodePanel from './HolographicNodePanel';
import NodeInfoPanel from './NodeInfoPanel';
import { type GameState, type GameAction } from '../game';

// must match the panels' close animation duration in styles.css (terminal settings:
// corners 0.62s @0.12s → ~0.74s). A little headroom so the retract fully finishes.
const NP_CLOSE_MS = 760;

/**
 * Keeps the inspection + info panels mounted through their CLOSE animation. When `selected`
 * goes null we hold the last node and play the retract (corner brackets combine back to centre
 * + the surface scales out) before unmounting — mirroring the terminal. Selecting another node
 * cancels any pending close and re-opens for the new node.
 */
export default function NodePanelHost({
  selected,
  readyNode,
  game,
  dispatch,
  onClose,
  suppressNode = null,
}: {
  selected: number | null;
  readyNode: number | null;
  game: GameState;
  dispatch: React.Dispatch<GameAction>;
  onClose: () => void;
  suppressNode?: number | null; // the HOME node — opens the subnetwork panel, not the inspection panel
}) {
  // `shown` is the node currently on screen. A selected node only mounts after
  // FlyCamera reports that the focus glide is far enough through its approach.
  const [shown, setShown] = useState<number | null>(null);
  const readyToShow = selected != null && selected === readyNode && selected !== suppressNode;
  if (readyToShow && selected !== shown) setShown(selected);

  // Only close when focus is actually cleared. While retargeting to another
  // selected node, keep the current panel mounted until the new node is ready.
  const closing = shown != null && selected == null;

  // hold the panel through its retract, then unmount. setShown only fires in the timer
  // callback (async — never synchronously inside the effect body).
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => {
    window.clearTimeout(timer.current);
    if (readyToShow || selected != null) return;
    if (!closing) return;
    timer.current = window.setTimeout(() => setShown(null), NP_CLOSE_MS);
    return () => window.clearTimeout(timer.current);
  }, [closing, readyToShow, selected]);

  if (shown == null || shown === suppressNode) return null; // HOME node uses the subnetwork panel
  return (
    <>
      <HolographicNodePanel
        selected={shown}
        game={game}
        dispatch={dispatch}
        onClose={onClose}
        closing={closing}
      />
      <NodeInfoPanel selected={shown} game={game} closing={closing} />
    </>
  );
}
