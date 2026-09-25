import { Component, computed, input, output } from '@angular/core';
import {
    LucideCircleAlert,
    LucideCircleCheck,
    LucideDynamicIcon,
    LucideInfo,
    LucideX,
} from '@lucide/angular';

export type AbToastSeverity = 'neutral' | 'success' | 'info' | 'error';

/**
 * A short, non-blocking message with an optional single action and an optional close button.
 * It is presentational: it has no live-region semantics of its own. `AbToastController` renders
 * it inside `role="status"` / `role="alert"` regions so screen readers announce it; if you place
 * it by hand, wrap it in one.
 */
@Component({
    selector: 'ab-toast',
    imports: [LucideDynamicIcon],
    templateUrl: './toast.html',
    styleUrl: './toast.scss',
    host: {
        class: 'ab-toast',
        '[class.ab-toast_success]': `severity() === 'success'`,
        '[class.ab-toast_info]': `severity() === 'info'`,
        '[class.ab-toast_error]': `severity() === 'error'`,
        '[class.ab-toast_leaving]': 'leaving()',
        '(keydown.escape)': 'onEscape($event)',
    },
})
export class AbToast {
    public readonly message = input.required<string>();
    /** Label of the single text action. Never use "Dismiss" here; that is the close button. */
    public readonly actionLabel = input<string>();
    public readonly severity = input<AbToastSeverity>('neutral');
    /** Shows the close button. */
    public readonly dismissible = input(false);
    public readonly closeLabel = input('Dismiss');
    /** Plays the exit transition. Set by the controller just before removal. */
    public readonly leaving = input(false);

    public readonly action = output<void>();
    public readonly dismissed = output<void>();

    protected readonly icon = computed(() => SEVERITY_ICONS[this.severity()]);
    protected readonly closeIcon = LucideX;

    protected onEscape(event: Event): void {
        event.stopPropagation();
        this.dismissed.emit();
    }
}

const SEVERITY_ICONS = {
    neutral: null,
    success: LucideCircleCheck,
    info: LucideInfo,
    error: LucideCircleAlert,
} as const;
