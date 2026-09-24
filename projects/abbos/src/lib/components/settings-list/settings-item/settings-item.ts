import { NgTemplateOutlet } from '@angular/common';
import { booleanAttribute, Component, input, output } from '@angular/core';
import { LucideChevronRight } from '@lucide/angular';
import { AbIcon } from '../../icon/icon';

let nextId = 0;

/**
 * One row of an `ab-settings-list`. Either navigates (`navigable`: value + chevron, the whole
 * row is a button emitting `activated`) or hosts an inline control projected into `[abControl]`.
 * A leading icon can be projected into `[abIcon]` (typically an `ab-icon`, styled by the caller).
 * A projected control needs its own accessible name (e.g. `ariaLabel`).
 */
@Component({
    selector: 'ab-settings-item',
    imports: [NgTemplateOutlet, AbIcon],
    templateUrl: './settings-item.html',
    styleUrl: './settings-item.scss',
    host: {
        class: 'ab-settings-item',
        role: 'listitem',
        '[class.ab-settings-item_navigable]': 'navigable()',
        '[class.ab-settings-item_disabled]': 'disabled()',
    },
})
export class AbSettingsItem {
    public readonly label = input.required<string>();
    public readonly description = input<string>();
    public readonly value = input<string>();
    public readonly navigable = input(false, { transform: booleanAttribute });
    public readonly disabled = input(false, { transform: booleanAttribute });

    public readonly activated = output<void>();

    protected readonly descriptionId = `ab-settings-item-description-${nextId++}`;
    protected readonly chevron = LucideChevronRight;
}
