import { describe, it, expect, vi, beforeEach } from 'vitest';
import Router from 'next/router';
import { 
  getCallbackUrl, 
  getChatLinkRelativePath, 
  useRouterQuery, 
  useRouterRoute, 
  navigateFn, 
  launchAppChat, 
  launchAppCall 
} from './app.routes';
import { isBrowser } from './util/pwaUtils';

vi.mock('next/router', () => ({
  default: {
    push: vi.fn(() => Promise.resolve(true)),
    replace: vi.fn(() => Promise.resolve(true)),
    back: vi.fn(),
  },
  useRouter: vi.fn(() => ({
    query: {},
    route: '/test-route',
  })),
}));

vi.mock('./util/pwaUtils', () => ({
  isBrowser: true,
}));

describe('app.routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('window', { location: { href: 'http://example.com' } });
  });

  describe('getCallbackUrl', () => {
    it('should return the correct callback URL for openrouter', () => {
      const url = getCallbackUrl('openrouter');
      expect(url).toBe('http://example.com/link/callback_openrouter');
    });

    it('should throw an error for unknown source', () => {
      expect(() => getCallbackUrl('unknown' as any)).toThrow('Unknown source: unknown');
    });
  });

  describe('getChatLinkRelativePath', () => {
    it('should replace [chatLinkId] with the provided chatLinkId', () => {
      const path = getChatLinkRelativePath('123');
      expect(path).toBe('/link/chat/123');
    });
  });

  describe('useRouterQuery', () => {
    it('should return the router query', () => {
      const query = useRouterQuery<{ test: string }>();
      expect(query).toEqual({});
    });
  });

  describe('useRouterRoute', () => {
    it('should return the current route', () => {
      const route = useRouterRoute();
      expect(route).toBe('/test-route');
    });
  });

  describe('navigateFn', () => {
    it('should call Router.push by default', async () => {
      const navigate = navigateFn('/test-path');
      await navigate();
      expect(Router.push).toHaveBeenCalledWith('/test-path');
    });

    it('should call Router.replace when replace is true', async () => {
      const navigate = navigateFn('/test-path');
      await navigate(true);
      expect(Router.replace).toHaveBeenCalledWith('/test-path');
    });
  });

  describe('launchAppChat', () => {
    it('should navigate to chat without conversationId', async () => {
      await launchAppChat();
      expect(Router.push).toHaveBeenCalledWith({
        pathname: '/',
        query: undefined,
      }, '/');
    });

    it('should navigate to chat with conversationId', async () => {
      await launchAppChat('conv-123');
      expect(Router.push).toHaveBeenCalledWith({
        pathname: '/',
        query: {
          initialConversationId: 'conv-123',
        },
      }, '/');
    });
  });

  describe('launchAppCall', () => {
    it('should navigate to call with conversationId and personaId', () => {
      launchAppCall('conv-123', 'persona-456');
      expect(Router.push).toHaveBeenCalledWith({
        pathname: '/call',
        query: {
          conversationId: 'conv-123',
          personaId: 'persona-456',
          backTo: 'app-chat',
        },
      });
    });
  });
});