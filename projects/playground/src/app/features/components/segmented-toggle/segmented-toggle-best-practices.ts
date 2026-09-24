import { Component } from '@angular/core';
import { AbSegmentedToggle, AbSwitch } from 'abbos';
import { BestPractice } from '../../../core/docs/doc.model';

@Component({
    imports: [AbSegmentedToggle],
    template: `<ab-segmented-toggle startLabel="Monthly" endLabel="Yearly" ariaLabel="Billing" />`,
})
class TwoPeers {}

@Component({
    imports: [AbSegmentedToggle],
    template: `<ab-segmented-toggle startLabel="Off" endLabel="On" ariaLabel="Notifications" />`,
})
class OnOff {}

@Component({
    imports: [AbSwitch],
    template: `<ab-switch [checked]="true">Notifications</ab-switch>`,
})
class UseSwitch {}

export const SEGMENTED_TOGGLE_BEST_PRACTICES: readonly BestPractice[] = [
    { ok: true, text: 'Offer two equal, clearly named alternatives.', component: TwoPeers },
    {
        ok: false,
        text: 'Use Off/On labels — a Switch says that better.',
        component: OnOff,
    },
    { ok: true, text: 'Reach for a Switch for a single on/off setting.', component: UseSwitch },
];
