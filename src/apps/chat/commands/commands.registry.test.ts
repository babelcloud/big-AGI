import { describe, it, expect, beforeEach, vi } from 'vitest';
import { findAllChatCommands, extractChatCommand } from './commands.registry';

// Mock setup
vi.mock('./CommandsAlter', () => ({
  CommandsAlter: {
    id: 'chat-alter',
    rank: 4,
    getCommands: vi.fn().mockReturnValue([
      { primary: '/alter', description: 'Alter command' },
    ]),
  },
}));

vi.mock('./CommandsBeam', () => ({
  CommandsBeam: {
    id: 'mode-beam',
    rank: 6,
    getCommands: vi.fn().mockReturnValue([
      { primary: '/beam', description: 'Beam command' },
    ]),
  },
}));

vi.mock('./CommandsBrowse', () => ({
  CommandsBrowse: {
    id: 'ass-browse',
    rank: 1,
    getCommands: vi.fn().mockReturnValue([
      { primary: '/browse', description: 'Browse command' },
    ]),
  },
}));

vi.mock('./CommandsDraw', () => ({
  CommandsDraw: {
    id: 'ass-t2i',
    rank: 3,
    getCommands: vi.fn().mockReturnValue([
      { primary: '/draw', description: 'Draw command', arguments: ['image'] },
    ]),
  },
}));

vi.mock('./CommandsHelp', () => ({
  CommandsHelp: {
    id: 'cmd-help',
    rank: 5,
    getCommands: vi.fn().mockReturnValue([
      { primary: '/help', description: 'Help command' },
    ]),
  },
}));

vi.mock('./CommandsReact', () => ({
  CommandsReact: {
    id: 'ass-react',
    rank: 2,
    getCommands: vi.fn().mockReturnValue([
      { primary: '/react', description: 'React command' },
    ]),
  },
}));

describe('findAllChatCommands', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should retrieve and sort all chat commands by rank', () => {
    const commands = findAllChatCommands();
    expect(commands).toEqual([
      { primary: '/browse', description: 'Browse command' },
      { primary: '/react', description: 'React command' },
      { primary: '/draw', description: 'Draw command', arguments: ['image'] },
      { primary: '/alter', description: 'Alter command' },
      { primary: '/help', description: 'Help command' },
      { primary: '/beam', description: 'Beam command' },
    ]);
  });
});

describe('extractChatCommand', () => {
  it('should return text type if input does not start with "/"', () => {
    const input = 'Hello world';
    const result = extractChatCommand(input);
    expect(result).toEqual([{ type: 'text', value: 'Hello world' }]);
  });

  it('should extract a command without arguments', () => {
    const input = '/help';
    const result = extractChatCommand(input);
    expect(result).toEqual([
      { type: 'cmd', providerId: 'cmd-help', command: '/help', params: undefined },
    ]);
  });

  it('should extract a command with arguments', () => {
    const input = '/draw image.jpg';
    const result = extractChatCommand(input);
    expect(result).toEqual([
      { type: 'cmd', providerId: 'ass-t2i', command: '/draw', params: 'image.jpg', isError: undefined },
    ]);
  });

  it('should return text if command is unknown', () => {
    const input = '/unknown command';
    const result = extractChatCommand(input);
    expect(result).toEqual([{ type: 'text', value: '/unknown command' }]);
  });

  it('should handle command with extra text', () => {
    const input = '/help extra text';
    const result = extractChatCommand(input);
    expect(result).toEqual([
      { type: 'cmd', providerId: 'cmd-help', command: '/help', params: undefined },
      { type: 'text', value: 'extra text' },
    ]);
  });
});