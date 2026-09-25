import { Component, computed, input, numberAttribute } from '@angular/core';

export type AbSkeletonVariant = 'text' | 'rect' | 'circle';
export type AbSkeletonAnimation = 'pulse' | 'shimmer' | 'none';

/**
 * A placeholder for content that is still loading. Compose several into the layout of the real
 * content (a card, a list row, an avatar with two lines) and give them the final dimensions so
 * nothing jumps when the data arrives.
 *
 * The skeleton is decorative and hidden from assistive technology. Mark the loading region
 * `aria-busy="true"` and announce the state yourself, for example with a visually hidden
 * `role="status"` message.
 *
 * It fades in after a short delay (`--delay`, 150ms), so fast loads never flash a placeholder.
 * Use it for content areas; use the button's `loading` state for short actions.
 */
@Component({
    selector: 'ab-skeleton',
    template: `
        @for (bar of bars(); track bar) {
            <span class="ab-skeleton-bar"></span>
        }
    `,
    styleUrl: './skeleton.scss',
    host: {
        class: 'ab-skeleton',
        'aria-hidden': 'true',
        '[class.ab-skeleton_text]': `variant() === 'text'`,
        '[class.ab-skeleton_rect]': `variant() === 'rect'`,
        '[class.ab-skeleton_circle]': `variant() === 'circle'`,
        '[class.ab-skeleton_pulse]': `animation() === 'pulse'`,
        '[class.ab-skeleton_shimmer]': `animation() === 'shimmer'`,
        '[style.--skeleton-w]': 'width()',
        '[style.--skeleton-h]': 'height()',
    },
})
export class AbSkeleton {
    public readonly variant = input<AbSkeletonVariant>('rect');
    /** Any CSS length. Text defaults to the full width, a rectangle to 100%, a circle to 40px. */
    public readonly width = input<string>();
    /** Any CSS length. Text bars are always one line tall; a circle defaults to its width. */
    public readonly height = input<string>();
    /** Number of text bars. The last one is shorter. Only applies to the `text` variant. */
    public readonly lines = input<number, unknown>(1, { transform: numberAttribute });
    public readonly animation = input<AbSkeletonAnimation>('pulse');

    protected readonly bars = computed(() => {
        const count = this.variant() === 'text' ? Math.max(1, Math.floor(this.lines())) : 1;
        return Array.from({ length: count }, (_, i) => i);
    });
}
