import {
    EnvironmentProviders,
    inject,
    makeEnvironmentProviders,
    provideEnvironmentInitializer,
} from '@angular/core';
import { CONTROL_SHAPE, CONTROL_SIZE } from './config';
import { AbControlShape, AbControlSize } from './constants';
import { AbAccent, AbThemeMode, AbThemeService } from './services';

/** Bootstrap-time configuration for the Abbos design system. */
export interface AbConfig {
    /** Initial color scheme. Defaults to 'light'. */
    theme?: AbThemeMode;
    /** Initial accent. Defaults to 'emerald'. */
    accent?: AbAccent;
    /**
    * Token overrides applied via AbThemeService.setCustomTokens: keys are
    * token names WITHOUT the --ab- prefix, e.g. { 'primary': '#0e7490' }.
    */
    tokens?: Record<string, string>;
    /**
     * Default control shape for all components. Defaults to 'round'.
     */
    controlShape?: AbControlShape;
    /**
     * Default control size for all components. Defaults to 'md'.
     */
    controlSize?: AbControlSize;
}

/**
* Configures the Abbos design system for an application (or any environment
* injector, e.g. a lazy route). Eagerly instantiates AbThemeService so the
* theme/accent attributes are reflected on <html> before first paint, even if
* no component injects the service.
*
* ```ts
* export const appConfig: ApplicationConfig = {
*   providers: [provideAbbos({ theme: 'dark', accent: 'indigo' })],
* };
* ```
*/
export function provideAbbos(config: AbConfig = {}): EnvironmentProviders {
    return makeEnvironmentProviders([
        provideEnvironmentInitializer(() => {
            const _themeService = inject(AbThemeService);

            if (config.theme) {
                _themeService.theme.set(config.theme);
            }

            if (config.accent) {
                _themeService.accent.set(config.accent);
            }

            if (config.tokens) {
                _themeService.setCustomTokens(config.tokens);
            }
        }),
        { provide: CONTROL_SHAPE, useValue: config.controlShape ?? 'round' },
        { provide: CONTROL_SIZE, useValue: config.controlSize ?? 'md' }
    ]);
}
