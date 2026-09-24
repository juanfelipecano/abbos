import { PACKAGE_NAME } from '../../core/docs/site';

export const INSTALL_COMMANDS: Record<string, string> = {
    npm: `$ npm install ${PACKAGE_NAME}`,
    pnpm: `$ pnpm add ${PACKAGE_NAME}`,
    yarn: `$ yarn add ${PACKAGE_NAME}`,
};

export const STYLES_SNIPPET = `@use '${PACKAGE_NAME}' as abbos;

@include abbos.fonts; // optional: Public Sans + JetBrains Mono
@include abbos.core;  // every --ab-* token, dark theme and accents
@include abbos.base;  // optional: light reset and body defaults`;

export const PROVIDERS_SNIPPET = `import { ApplicationConfig } from '@angular/core';
import { provideAbbos } from '${PACKAGE_NAME}';

export const appConfig: ApplicationConfig = {
  providers: [provideAbbos()],
};`;

export const QUICK_USAGE_SNIPPET = `import { Component, signal } from '@angular/core';
import { AbButton, AbInput, AbSwitch } from '${PACKAGE_NAME}';

@Component({
  selector: 'app-profile',
  imports: [AbButton, AbInput, AbSwitch],
  template: \`
    <label for="name">Display name</label>
    <input ab-input id="name" placeholder="Rafi Ahmed" />

    <ab-switch [(checked)]="isPublic">Public profile</ab-switch>

    <button ab-button (click)="save()">Save changes</button>
  \`,
})
export class Profile {
  isPublic = signal(true);

  save() {
    // …
  }
}`;

export const THEMING_SNIPPET = `provideAbbos({
  theme: 'dark',            // 'light' | 'dark'
  accent: 'indigo',         // 'emerald' | 'indigo' | 'blue' | 'amber' | 'mono'
  controlShape: 'circle',   // default shape for every control
  controlSize: 'sm',        // default size for every control
  tokens: { radius: '12px' }, // any --ab-* token, without the prefix
});`;

export const RUNTIME_THEME_SNIPPET = `import { inject } from '@angular/core';
import { AbThemeService } from '${PACKAGE_NAME}';

export class ThemeToggle {
  private theme = inject(AbThemeService);

  toggle() {
    this.theme.toggleTheme();
  }
}`;
