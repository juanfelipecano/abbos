import { ApplicationRef, DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AbThemeService } from './theme';

describe('AbThemeService', () => {
  it('reflects theme and accent onto the document element', () => {
    const service = TestBed.inject(AbThemeService);
    const appRef = TestBed.inject(ApplicationRef);
    const root = TestBed.inject(DOCUMENT).documentElement;

    appRef.tick();
    expect(root.hasAttribute('data-ab-theme')).toBe(false);
    expect(root.hasAttribute('data-ab-accent')).toBe(false);

    service.theme.set('dark');
    service.accent.set('indigo');
    appRef.tick();
    expect(root.getAttribute('data-ab-theme')).toBe('dark');
    expect(root.getAttribute('data-ab-accent')).toBe('indigo');

    service.toggleTheme();
    service.accent.set('emerald');
    appRef.tick();
    expect(root.hasAttribute('data-ab-theme')).toBe(false);
    expect(root.hasAttribute('data-ab-accent')).toBe(false);
  });

  it('sets custom tokens as inline --ab-* properties', () => {
    const service = TestBed.inject(AbThemeService);
    const root = TestBed.inject(DOCUMENT).documentElement;

    service.setCustomTokens({ primary: '#0e7490', 'radius-control': '12px' });
    expect(root.style.getPropertyValue('--ab-primary')).toBe('#0e7490');
    expect(root.style.getPropertyValue('--ab-radius-control')).toBe('12px');

    root.style.removeProperty('--ab-primary');
    root.style.removeProperty('--ab-radius-control');
  });
});
