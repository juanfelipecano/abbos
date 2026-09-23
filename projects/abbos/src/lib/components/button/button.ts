import { booleanAttribute, Component, inject, input } from '@angular/core';
import { AbControlShape, AbControlSize } from '../../constants';
import { CONTROL_SHAPE, CONTROL_SIZE } from '../../config';

export type AbButtonVariant = 'primary' | 'secondary' | 'soft' | 'outline' | 'ghost' | 'danger';

@Component({
    selector: 'button[ab-button]',
    templateUrl: './button.html',
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
        '[class.ab-button_full]': 'full()',
        '[attr.aria-busy]': 'loading() || null',
        '[attr.aria-disabled]': 'disabled() || loading() || null',
        '(click)': 'onClick($event)',
        '(keydown)': 'onKeydown($event)',
    },
})
export class AbButton {
    private readonly _defaultSize = inject(CONTROL_SIZE);
    private readonly _defaultShape = inject(CONTROL_SHAPE);

    public readonly variant = input<AbButtonVariant>('primary');
    public readonly size = input<AbControlSize>(this._defaultSize);
    public readonly shape = input<AbControlShape>(this._defaultShape);
    public readonly full = input(false, { transform: booleanAttribute });
    public readonly loading = input(false, { transform: booleanAttribute });
    public readonly disabled = input(false, { transform: booleanAttribute });

    protected onClick(event: MouseEvent): void {
        if (this.disabled() || this.loading()) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    }

    protected onKeydown(event: KeyboardEvent): void {
        if ((this.disabled() || this.loading()) && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
        }
    }
}
