import { NgTemplateOutlet } from '@angular/common';
import { booleanAttribute, Component, computed, inject, input, model, output } from '@angular/core';
import { CONTROL_SHAPE, CONTROL_SIZE } from '../../config';
import { AbControlShape, AbControlSize } from '../../constants';

export type AbChipVariant = 'neutral' | 'soft' | 'outline' | 'dotted' | 'solid';

let nextId = 0;

@Component({
    selector: 'ab-chip',
    imports: [NgTemplateOutlet],
    templateUrl: './chip.html',
    styleUrl: './chip.scss',
    host: {
        class: 'ab-chip',
        '[class.ab-chip_neutral]': `variant() === 'neutral'`,
        '[class.ab-chip_soft]': `variant() === 'soft'`,
        '[class.ab-chip_outline]': `variant() === 'outline'`,
        '[class.ab-chip_dotted]': `variant() === 'dotted'`,
        '[class.ab-chip_solid]': `variant() === 'solid'`,
        '[class.ab-chip_sm]': `size() === 'sm'`,
        '[class.ab-chip_md]': `size() === 'md'`,
        '[class.ab-chip_lg]': `size() === 'lg'`,
        '[class.ab-chip_square]': `shape() === 'square'`,
        '[class.ab-chip_round]': `shape() === 'round'`,
        '[class.ab-chip_circle]': `shape() === 'circle'`,
        '[class.ab-chip_selectable]': 'selectable()',
        '[class.ab-chip_selected]': 'selectable() && selected()',
        '[class.ab-chip_removable]': 'isRemovable()',
        '[class.ab-chip_disabled]': 'disabled()',
        '[attr.tabindex]': 'isRemovable() && !disabled() ? 0 : null',
        '[attr.aria-disabled]': 'isRemovable() && disabled() ? true : null',
        '[attr.aria-keyshortcuts]': `isRemovable() ? 'Backspace Delete' : null`,
        '(keydown)': 'onKeydown($event)',
    },
})
export class AbChip {
    private readonly _defaultSize = inject(CONTROL_SIZE);
    private readonly _defaultShape = inject(CONTROL_SHAPE);

    public readonly variant = input<AbChipVariant>('neutral');
    public readonly size = input<AbControlSize>(this._defaultSize);
    public readonly shape = input<AbControlShape>(this._defaultShape);
    /** Shows a remove button and lets Backspace/Delete dismiss the chip. Ignored when `selectable`. */
    public readonly removable = input(false, { transform: booleanAttribute });
    /** Accessible name prefix of the remove button; the chip label is appended. */
    public readonly removeLabel = input('Remove');
    /** Turns the chip into a toggle button. Takes precedence over `removable`. */
    public readonly selectable = input(false, { transform: booleanAttribute });
    public readonly selected = model(false);
    public readonly disabled = input(false, { transform: booleanAttribute });

    public readonly removed = output<void>();

    protected readonly isRemovable = computed(() => this.removable() && !this.selectable());
    protected readonly uid = `ab-chip-${nextId++}`;

    protected toggle(): void {
        if (!this.disabled()) {
            this.selected.update((value) => !value);
        }
    }

    protected remove(): void {
        if (!this.disabled()) {
            this.removed.emit();
        }
    }

    protected onKeydown(event: KeyboardEvent): void {
        if (this.isRemovable() && (event.key === 'Backspace' || event.key === 'Delete')) {
            event.preventDefault();
            this.remove();
        }
    }
}
