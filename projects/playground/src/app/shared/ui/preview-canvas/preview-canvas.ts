import { booleanAttribute, Component, inject, input, linkedSignal } from '@angular/core';
import { LucideMoon, LucideSun } from '@lucide/angular';
import { AbThemeMode, AbThemeService } from 'abbos';

/**
 * Surface that hosts live previews. With `themeToggle` it gets its own light/dark switch that
 * starts from the site theme, so a component can be checked in both without leaving the page.
 */
@Component({
    selector: 'app-preview-canvas',
    imports: [LucideSun, LucideMoon],
    template: `
        <div
            class="canvas"
            [class.pg-dotted]="dotted()"
            [class.surface]="surface()"
            [attr.data-ab-theme]="themeToggle() ? theme() : null"
        >
            @if (label(); as text) {
                <span class="label" aria-hidden="true">{{ text }}</span>
            }
            @if (themeToggle()) {
                <div class="themes" role="group" aria-label="Preview theme">
                    <button
                        type="button"
                        aria-label="Light preview"
                        [attr.aria-pressed]="theme() === 'light'"
                        (click)="theme.set('light')"
                    >
                        <svg lucideSun [size]="14" aria-hidden="true"></svg>
                    </button>
                    <button
                        type="button"
                        aria-label="Dark preview"
                        [attr.aria-pressed]="theme() === 'dark'"
                        (click)="theme.set('dark')"
                    >
                        <svg lucideMoon [size]="14" aria-hidden="true"></svg>
                    </button>
                </div>
            }
            <ng-content />
        </div>
    `,
    styleUrl: './preview-canvas.scss',
    host: { '[class.framed]': 'label()' },
})
export class PreviewCanvas {
    public readonly themeToggle = input(false, { transform: booleanAttribute });
    public readonly dotted = input(true);
    public readonly label = input<string>();
    /** Card-coloured background instead of the page colour. */
    public readonly surface = input(false, { transform: booleanAttribute });

    private readonly siteTheme = inject(AbThemeService).theme;
    /** Follows the site theme until the user picks one here. */
    protected readonly theme = linkedSignal<AbThemeMode>(() => this.siteTheme());
}
