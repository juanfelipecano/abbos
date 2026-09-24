import { DOCUMENT, effect, inject, Service } from '@angular/core';
import { AbThemeMode, AbThemeService } from 'abbos';

const STORAGE_KEY = 'abbos-docs-theme';

/**
 * Remembers the docs theme across visits. Falls back to the OS preference the first time.
 * Storage can be unavailable (private mode, blocked site data), so every access is guarded.
 */
@Service()
export class ThemePreference {
    private readonly theme = inject(AbThemeService);
    private readonly window = inject(DOCUMENT).defaultView;

    constructor() {
        this.theme.setTheme(this.stored() ?? this.system());
        effect(() => this.store(this.theme.theme()));
    }

    private stored(): AbThemeMode | null {
        try {
            const value = this.window?.localStorage.getItem(STORAGE_KEY);
            return value === 'light' || value === 'dark' ? value : null;
        } catch {
            return null;
        }
    }

    private system(): AbThemeMode {
        return this.window?.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    private store(theme: AbThemeMode): void {
        try {
            this.window?.localStorage.setItem(STORAGE_KEY, theme);
        } catch {
            // Storage blocked: the theme still works for this visit.
        }
    }
}
