import { useCallback, useState } from 'react';
import Game from './GameApp';
import Landing from './components/landing/Landing';

/**
 * Top-level gate: `/` always starts on the landing so the project identity is visible.
 * Pressing ENTER NETWORK mounts the game; the in-game INTRO control returns here.
 * Only one of Landing / Game is mounted at a time, so there is never more than one
 * WebGL context live.
 */
export default function App() {
  const [entered, setEntered] = useState(false);

  const enter = useCallback(() => {
    setEntered(true);
  }, []);

  const showIntro = useCallback(() => setEntered(false), []);

  return entered ? <Game onShowIntro={showIntro} /> : <Landing onEnter={enter} />;
}
