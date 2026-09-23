import { DOCUMENT, effect, inject, Service, signal } from '@angular/core';

export type AbThemeMode = 'light' | 'dark';
export type AbAccent = 'emerald' | 'indigo' | 'blue' | 'amber' | 'mono';

export const AB_ACCENTS: readonly AbAccent[] = ['emerald', 'indigo', 'blue', 'amber', 'mono'];

@Service()
export class AbThemeService {
    private readonly document = inject(DOCUMENT);

    public readonly theme = signal<AbThemeMode>('light');
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

    public setTheme(theme: AbThemeMode): void {
        this.theme.set(theme);
    }

    public setAccent(accent: AbAccent): void {
        this.accent.set(accent);
    }

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
