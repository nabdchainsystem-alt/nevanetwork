/**
 * NEVA Terminal command parser — pure, deterministic, no side effects. Maps a raw input
 * line to display lines + an optional effect the UI/game layer carries out. Kept separate
 * from the React component so it is trivial to test.
 */
import type { NodeType } from './game';

export type TerminalEffect =
  | { kind: 'goto'; type: NodeType }
  | { kind: 'scan'; mode: 'on' | 'off' | 'toggle' }
  | { kind: 'finishMission' } // DEV: mark the current mission complete (fast testing)
  | { kind: 'clear' }
  | { kind: 'close' };

export interface TerminalResult {
  lines: string[]; // immediate response lines (the caller may append more, e.g. goto result)
  effect?: TerminalEffect;
}

// command word → node type (lots of forgiving aliases so natural typing works)
const TYPE_ALIASES: Record<string, NodeType> = {
  memory: 'MEMORY', mem: 'MEMORY',
  message: 'MESSAGE', msg: 'MESSAGE', comms: 'MESSAGE',
  camera: 'CAMERA', cam: 'CAMERA', watcher: 'CAMERA', watch: 'CAMERA',
  identity: 'IDENTITY', ident: 'IDENTITY', id: 'IDENTITY',
  archive: 'ARCHIVE', arch: 'ARCHIVE',
  gateway: 'GATEWAY', gate: 'GATEWAY', gw: 'GATEWAY',
  decoy: 'DECOY',
  locked: 'LOCKED', lock: 'LOCKED',
};

const HELP: string[] = [
  'COMMANDS',
  '  go to <type>   route to the nearest node',
  '  scan [on|off]  toggle silver kind markers',
  '  finish mission  complete now (dev test)',
  '  help           show this list',
  '  clear          wipe the log',
  '  close          exit terminal  (or ESC)',
  'TYPES  memory  message  camera  identity',
  '       archive  gateway  decoy  locked',
  'KEYS   P  playtest notes (local QA logger)',
];

export function parseCommand(raw: string): TerminalResult {
  const cmd = raw.trim().toLowerCase().replace(/\s+/g, ' ');
  if (!cmd) return { lines: [] };

  if (cmd === 'help' || cmd === '?' || cmd === 'h') return { lines: HELP };
  if (cmd === 'clear' || cmd === 'cls') return { lines: [], effect: { kind: 'clear' } };
  if (cmd === 'close' || cmd === 'exit' || cmd === 'q')
    return { lines: [], effect: { kind: 'close' } };

  if (cmd === 'scan' || cmd === 'scan toggle')
    return { lines: [], effect: { kind: 'scan', mode: 'toggle' } };
  if (cmd === 'scan on') return { lines: [], effect: { kind: 'scan', mode: 'on' } };
  if (cmd === 'scan off') return { lines: [], effect: { kind: 'scan', mode: 'off' } };

  // DEV: skip the grind — mark the current mission complete so you can advance for testing
  if (cmd === 'finish mission' || cmd === 'finish' || cmd === 'complete mission' || cmd === 'fm')
    return { lines: [], effect: { kind: 'finishMission' } };

  // route commands: "go to <type>" / "goto <type>" / "go <type>" / "nearest <type>"
  let rest: string | null = null;
  if (cmd.startsWith('go to ')) rest = cmd.slice(6);
  else if (cmd.startsWith('goto ')) rest = cmd.slice(5);
  else if (cmd.startsWith('go ')) rest = cmd.slice(3);
  else if (cmd.startsWith('nearest ')) rest = cmd.slice(8);
  if (rest != null) {
    const key = rest.trim();
    const type = TYPE_ALIASES[key];
    if (!type) return { lines: [`UNKNOWN TYPE: ${key.toUpperCase()} · TYPE HELP`] };
    return { lines: [], effect: { kind: 'goto', type } };
  }

  return { lines: [`UNKNOWN COMMAND: ${cmd.toUpperCase()} · TYPE HELP`] };
}
