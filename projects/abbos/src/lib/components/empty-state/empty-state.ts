import { Component, input, numberAttribute } from '@angular/core';

export type AbEmptyStateSize = 'sm' | 'md';
export type AbEmptyStateHeadingLevel = 2 | 3 | 4 | 5 | 6;

/**
 * Explains why a view is empty and offers the next step. Three parts:
 *
 * 1. **Media**: project an `ab-icon`, an image or an SVG illustration into `[abMedia]`.
 * 2. **Body**: a `title`, a one-line `description`, and any extra content projected by default.
 * 3. **Actions**: project up to two buttons into `[abActions]`, the most useful next step first.
 *
 * The host is a `role="status"` live region so screen readers announce it when results clear.
 * Render it only when the view is actually empty.
 */
@Component({
    selector: 'ab-empty-state',
    templateUrl: './empty-state.html',
    styleUrl: './empty-state.scss',
    host: {
        class: 'ab-empty-state',
        role: 'status',
        '[class.ab-empty-state_sm]': `size() === 'sm'`,
        '[class.ab-empty-state_md]': `size() === 'md'`,
    },
})
export class AbEmptyState {
    public readonly title = input.required<string>();
    public readonly description = input<string>();
    public readonly size = input<AbEmptyStateSize>('md');
    /** Level of the title heading, so the page outline stays valid. */
    public readonly headingLevel = input<AbEmptyStateHeadingLevel, unknown>(3, {
        transform: numberAttribute as (value: unknown) => AbEmptyStateHeadingLevel,
    });
}
