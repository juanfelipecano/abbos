import { booleanAttribute, Component, inject, input } from '@angular/core';
import { AbControlShape, AbControlSize } from '../../../constants';
import { CONTROL_SHAPE, CONTROL_SIZE } from '../../../config';

@Component({
    selector: 'input[ab-input]',
    template: '',
    styleUrl: './input.scss',
    host: {
        class: 'ab-input',
        '[class.ab-input_sm]': `size() === 'sm'`,
        '[class.ab-input_md]': `size() === 'md'`,
        '[class.ab-input_lg]': `size() === 'lg'`,
        '[class.ab-input_round]': `shape() === 'round'`,
        '[class.ab-input_square]': `shape() === 'square'`,
        '[class.ab-input_circle]': `shape() === 'circle'`,
        '[class.ab-input_invalid]': 'invalid()',
        '[attr.aria-invalid]': 'invalid() || null',
    },
})
export class AbInput {
    private readonly _defaultSize = inject(CONTROL_SIZE);
    private readonly _defaultShape = inject(CONTROL_SHAPE);

    public readonly size = input<AbControlSize>(this._defaultSize);
    public readonly shape = input<AbControlShape>(this._defaultShape);
    readonly invalid = input(false, { transform: booleanAttribute });
}
