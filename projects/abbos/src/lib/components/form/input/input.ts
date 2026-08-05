import { booleanAttribute, Component, inject, input } from '@angular/core';
import { AbControlShape, AbControlSize } from '../../../constants';
import { CONTROL_SHAPE, CONTROL_SIZE } from '../../../config';

/**
 * Styles a native `<input>` per the Abbos Design System. Presentation-only —
 * value read/write, `disabled`, and validity-state classes all come from
 * Angular's own `DefaultValueAccessor`/`NgControl` (see ADR-0001); this
 * directive adds no form logic.
 *
 * Renders no label. Callers must supply an accessible name via `aria-label`,
 * `aria-labelledby`, or a `<label for>` pointing at the input's `id` — this
 * directive cannot do that for you, the same way a plain `<input>` can't.
 *
 * @example
 * <input ab-input type="text" aria-label="Email" placeholder="you@example.com" />
 */
@Component({
    selector: 'input[ab-input]',
    template: '',
    styleUrl: './input.scss',
    host: {
        'class': 'ab-input',
        '[class.ab-input_sm]': `size() === 'sm'`,
        '[class.ab-input_md]': `size() === 'md'`,
        '[class.ab-input_lg]': `size() === 'lg'`,
        '[class.ab-input_round]': `shape() === 'round'`,
        '[class.ab-input_square]': `shape() === 'square'`,
        '[class.ab-input_circle]': `shape() === 'circle'`,
        '[class.ab-input_invalid]': 'invalid()',
    },
})
export class AbInput {
    private readonly _defaultSize = inject(CONTROL_SIZE);
    private readonly _defaultShape = inject(CONTROL_SHAPE);

    /** Control height/padding/font-size. Defaults to `'md'`. */
    public readonly size = input<AbControlSize>(this._defaultSize);

    /** Border radius. Defaults to `'round'`. */
    public readonly shape = input<AbControlShape>(this._defaultShape);

    /** Whether the input is in an invalid state. Defaults to `false`. */
    readonly invalid = input(false, { transform: booleanAttribute });
}
