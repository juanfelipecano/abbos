import { Component } from '@angular/core';
import { AbInput } from 'abbos';
import { BestPractice } from '../../../core/docs/doc.model';

@Component({
    imports: [AbInput],
    template: `
        <div class="pg-field">
            <label for="bp-email">Email</label>
            <input ab-input id="bp-email" placeholder="you@company.com" tabindex="-1" />
        </div>
    `,
})
class VisibleLabel {}

@Component({
    imports: [AbInput],
    template: `
        <div class="pg-field">
            <input ab-input placeholder="Email" aria-label="Email" tabindex="-1" />
        </div>
    `,
})
class PlaceholderOnly {}

export const INPUT_BEST_PRACTICES: readonly BestPractice[] = [
    { ok: true, text: 'Keep a visible label above the field.', component: VisibleLabel },
    {
        ok: false,
        text: 'Use the placeholder as the only label — it disappears as you type.',
        component: PlaceholderOnly,
    },
];
