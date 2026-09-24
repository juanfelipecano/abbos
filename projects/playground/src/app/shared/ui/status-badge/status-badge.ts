import { Component, input } from '@angular/core';

export type BadgeTone = 'primary' | 'info' | 'warning' | 'success' | 'neutral';

const TONE_BY_LABEL: Record<string, BadgeTone> = {
    New: 'primary',
    Beta: 'info',
    'Coming soon': 'neutral',
    Sample: 'warning',
};

/** Pill with a status dot: New, Beta, Coming soon… Tone follows the label unless given. */
@Component({
    selector: 'app-status-badge',
    template: `<span class="dot" aria-hidden="true"></span>{{ label() }}`,
    styleUrl: './status-badge.scss',
    host: { '[attr.data-tone]': 'tone() ?? toneFor(label())' },
})
export class StatusBadge {
    public readonly label = input.required<string>();
    public readonly tone = input<BadgeTone>();

    protected toneFor(label: string): BadgeTone {
        return TONE_BY_LABEL[label] ?? 'neutral';
    }
}
