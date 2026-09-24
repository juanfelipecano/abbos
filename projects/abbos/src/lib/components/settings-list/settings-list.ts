import { Component, input } from '@angular/core';

/** Card that groups `ab-settings-item` rows; each row draws its own divider. */
@Component({
    selector: 'ab-settings-list',
    template: '<ng-content />',
    styleUrl: './settings-list.scss',
    host: {
        class: 'ab-settings-list',
        role: 'list',
        '[attr.aria-label]': 'ariaLabel() ?? null',
    },
})
export class AbSettingsList {
    public readonly ariaLabel = input<string>();
}
