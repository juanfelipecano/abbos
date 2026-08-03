import { ApplicationRef, DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideAbbos } from './abbos-config-provider';
import { AbThemeService } from './services/theme';

describe('provideAbbos', () => {
  afterEach(() => {
    const root = document.documentElement;
    root.removeAttribute('data-ab-theme');
    root.removeAttribute('data-ab-accent');
    root.style.removeProperty('--ab-primary');
  });

  it('applies the initial theme, accent, and custom tokens at bootstrap', () => {
    TestBed.configureTestingModule({
      providers: [
        provideAbbos({ theme: 'dark', accent: 'indigo', tokens: { primary: '#0e7490' } }),
      ],
    });

    const appRef = TestBed.inject(ApplicationRef);
    const root = TestBed.inject(DOCUMENT).documentElement;

    appRef.tick();
    expect(root.getAttribute('data-ab-theme')).toBe('dark');
    expect(root.getAttribute('data-ab-accent')).toBe('indigo');
    expect(root.style.getPropertyValue('--ab-primary')).toBe('#0e7490');
  });

  it('keeps the service defaults when called without config', () => {
    TestBed.configureTestingModule({ providers: [provideAbbos()] });

    const appRef = TestBed.inject(ApplicationRef);
    const root = TestBed.inject(DOCUMENT).documentElement;

    appRef.tick();
    expect(TestBed.inject(AbThemeService).theme()).toBe('light');
    expect(TestBed.inject(AbThemeService).accent()).toBe('emerald');
    expect(root.hasAttribute('data-ab-theme')).toBe(false);
    expect(root.hasAttribute('data-ab-accent')).toBe(false);
  });
});
