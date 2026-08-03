import { DOCUMENT, effect, inject, Service, signal } from '@angular/core';

export type AbThemeMode = 'light' | 'dark';
export type AbAccent = 'emerald' | 'indigo' | 'blue' | 'amber' | 'mono';

export const AB_ACCENTS: readonly AbAccent[] = ['emerald', 'indigo', 'blue', 'amber', 'mono'];

/**
* Abbos theme switcher. Reflects the `theme` and `accent` signals onto
* `<html data-ab-theme data-ab-accent>`, which is what the token layer
* (see the `core` Sass mixin) keys its dark/accent overrides on.
* Emerald is the built-in default accent, so it maps to "no attribute".
*/
@Service()
export class AbThemeService {
    private readonly document = inject(DOCUMENT);

    /** Current color scheme. */
    public readonly theme = signal<AbThemeMode>('light');

    /** Current accent; retheming swaps only the --ab-primary-* group. */
    public readonly accent = signal<AbAccent>('emerald');

    constructor() {
        effect(() => {
            this.reflectAttr('data-ab-theme', this.theme() === 'dark' ? 'dark' : null);
        });

        effect(() => {
            const accent = this.accent();
            this.reflectAttr('data-ab-accent', accent === 'emerald' ? null : accent);
        });
    }

    public toggleTheme(): void {
        this.theme.update((theme) => (theme === 'dark' ? 'light' : 'dark'));
    }

    /**
    * Build a theme at runtime: sets each entry as an inline --ab-* custom
    * property on <html>. Keys are token names WITHOUT the --ab- prefix,
    * e.g. { 'primary': '#0e7490', 'radius-control': '12px' }.
    */
    public setCustomTokens(tokens: Record<string, string>): void {
        const root = this.document.documentElement;
        for (const [name, value] of Object.entries(tokens)) {
            root.style.setProperty(`--ab-${name}`, value);
        }
    }

    private reflectAttr(attribute: string, value: string | null): void {
        const root = this.document.documentElement;

        if (value === null) {
            root.removeAttribute(attribute);
        } else {
            root.setAttribute(attribute, value);
        }
    }
}
