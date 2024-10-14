import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkDivider, checkVisibileIcon, checkVisibleNav, navItems } from './app.nav';

// Mocking the missing modules
vi.mock('~/common/app.config', () => ({
  Brand: {
    URIs: {
      SupportInvite: 'https://discord.com/invite/example',
      OpenRepo: 'https://github.com/example',
    },
  },
}));

vi.mock('~/common/components/icons/3rdparty/DiscordIcon', () => ({
  DiscordIcon: () => null,
}));

vi.mock('~/common/components/icons/ChatBeamIcon', () => ({
  ChatBeamIcon: () => null,
}));

vi.mock('~/modules/trade/link/store-link', () => ({
  hasNoChatLinkItems: () => false,
}));

describe('app.nav tests', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('checkDivider', () => {
    it('should return true for a divider item', () => {
      const dividerItem = navItems.apps.find(app => app.name === '__DIVIDER__');
      expect(checkDivider(dividerItem)).toBe(true);
    });

    it('should return false for a non-divider item', () => {
      const nonDividerItem = navItems.apps.find(app => app.name !== '__DIVIDER__');
      expect(checkDivider(nonDividerItem)).toBe(false);
    });
  });

  describe('checkVisibileIcon', () => {
    it('should return false if hideOnMobile is true and isMobile is true', () => {
      const app = { hideOnMobile: true } as any;
      expect(checkVisibileIcon(app, true)).toBe(false);
    });

    it('should return true if the app is the currentApp', () => {
      const app = {} as any;
      expect(checkVisibileIcon(app, false, app)).toBe(true);
    });

    it('should return false if hideIcon is a function returning true', () => {
      const app = { hideIcon: () => true } as any;
      expect(checkVisibileIcon(app, false)).toBe(false);
    });

    it('should return true if hideIcon is false', () => {
      const app = { hideIcon: false } as any;
      expect(checkVisibileIcon(app, false)).toBe(true);
    });
  });

  describe('checkVisibleNav', () => {
    it('should return false if app is undefined', () => {
      expect(checkVisibleNav(undefined)).toBe(false);
    });

    it('should return false if hideNav is a function returning true', () => {
      const app = { hideNav: () => true } as any;
      expect(checkVisibleNav(app)).toBe(false);
    });

    it('should return true if hideNav is false', () => {
      const app = { hideNav: false } as any;
      expect(checkVisibleNav(app)).toBe(true);
    });
  });
});