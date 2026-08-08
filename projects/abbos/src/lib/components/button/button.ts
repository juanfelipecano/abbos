import { booleanAttribute, Component, inject, input } from '@angular/core';
import { AbControlShape, AbControlSize } from '../../constants';
import { CONTROL_SHAPE, CONTROL_SIZE } from '../../config';

export type AbButtonVariant = 'primary' | 'secondary' | 'soft' | 'outline' | 'ghost' | 'danger';

/**
 * Abbos Button — the primary action control. Renders as a real native `<button>` styled
 * per the Abbos Design System.
 *
 * The projected content is the button's accessible name, same as a plain `<button>`. An
 * icon-only button (only `abStart`/`abEnd` content, no visible text) must supply its own
 * `aria-label` — this component cannot enforce that at compile time, the same limitation a
 * bare `<button>` with no text content already has.
 *
 * @example
 * <button ab-button>Save changes</button>
 * <button ab-button variant="danger" size="lg">Delete account</button>
 * <button ab-button variant="outline"><svg abStart></svg> Export</button>
 * <button ab-button [loading]="saving()">Save</button>
 */
@Component({
    selector: 'button[ab-button]',
    template: `
        @if (loading()) {
            <span class="ab-button-spinner" aria-hidden="true"></span>
        }
        <span class="ab-button-slot"><ng-content select="[abStart]" /></span>
        <ng-content />
        <span class="ab-button-slot"><ng-content select="[abEnd]" /></span>
    `,
    styleUrl: './button.scss',
    host: {
        class: 'ab-button',
        '[class.ab-button_primary]': `variant() === 'primary'`,
        '[class.ab-button_secondary]': `variant() === 'secondary'`,
        '[class.ab-button_soft]': `variant() === 'soft'`,
        '[class.ab-button_outline]': `variant() === 'outline'`,
        '[class.ab-button_ghost]': `variant() === 'ghost'`,
        '[class.ab-button_danger]': `variant() === 'danger'`,
        '[class.ab-button_sm]': `size() === 'sm'`,
        '[class.ab-button_md]': `size() === 'md'`,
        '[class.ab-button_lg]': `size() === 'lg'`,
        '[class.ab-button_square]': `shape() === 'square'`,
        '[class.ab-button_round]': `shape() === 'round'`,
        '[class.ab-button_circle]': `shape() === 'circle'`,
        '[class.ab-button_loading]': 'loading()',
        '[attr.aria-busy]': 'loading() || null',
        '[disabled]': 'disabled() || loading()',
    },
})
export class AbButton {
    private readonly _defaultSize = inject(CONTROL_SIZE);
    private readonly _defaultShape = inject(CONTROL_SHAPE);

    /** Visual emphasis. Defaults to `'primary'`. */
    public readonly variant = input<AbButtonVariant>('primary');

    /** Control height/padding/font-size. Defaults to the injected `CONTROL_SIZE` token. */
    public readonly size = input<AbControlSize>(this._defaultSize);

    /** Corner treatment. Defaults to the injected `CONTROL_SHAPE` token. */
    public readonly shape = input<AbControlShape>(this._defaultShape);

    /**
     * Shows a spinner, sets `aria-busy`, hides `abStart`/`abEnd` content, and forces
     * `disabled`. Defaults to `false`.
     */
    public readonly loading = input(false, { transform: booleanAttribute });

    /** Disables interaction. Defaults to `false`. */
    public readonly disabled = input(false, { transform: booleanAttribute });
}
