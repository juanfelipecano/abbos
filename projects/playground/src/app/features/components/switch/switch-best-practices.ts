import { Component } from '@angular/core';
import { AbButton, AbSwitch } from 'abbos';
import { BestPractice } from '../../../core/docs/doc.model';

@Component({
    imports: [AbSwitch],
    template: `<ab-switch [checked]="true">Dark mode</ab-switch>`,
})
class ImmediateSetting {}

@Component({
    imports: [AbSwitch, AbButton],
    template: `
        <ab-switch>Dark mode</ab-switch>
        <button ab-button size="sm" tabindex="-1">Save</button>
    `,
    host: { class: 'pg-row' },
})
class SwitchWithSave {}

export const SWITCH_BEST_PRACTICES: readonly BestPractice[] = [
    {
        ok: true,
        text: 'Use for settings that take effect immediately.',
        component: ImmediateSetting,
    },
    {
        ok: false,
        text: 'Pair a switch with a Save button — the change should already be applied.',
        component: SwitchWithSave,
    },
];
