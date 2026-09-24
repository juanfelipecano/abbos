import { Component } from '@angular/core';
import { LucidePlus } from '@lucide/angular';
import { AbButton } from 'abbos';
import { BestPractice } from '../../../core/docs/doc.model';

@Component({
    imports: [AbButton],
    template: `
        <button ab-button variant="ghost" tabindex="-1">Cancel</button>
        <button ab-button tabindex="-1">Save changes</button>
    `,
    host: { class: 'pg-row' },
})
class OnePrimary {}

@Component({
    imports: [AbButton],
    template: `
        <button ab-button tabindex="-1">Save</button>
        <button ab-button tabindex="-1">Publish</button>
        <button ab-button tabindex="-1">Share</button>
    `,
    host: { class: 'pg-row' },
})
class ManyPrimary {}

@Component({
    imports: [AbButton, LucidePlus],
    template: `
        <button ab-button tabindex="-1">
            <svg abStart lucidePlus [size]="16" aria-hidden="true"></svg>Create project
        </button>
    `,
    host: { class: 'pg-row' },
})
class ClearLabel {}

@Component({
    imports: [AbButton],
    template: `<button ab-button variant="outline" tabindex="-1">Click Here To Continue</button>`,
    host: { class: 'pg-row' },
})
class VagueLabel {}

export const BUTTON_BEST_PRACTICES: readonly BestPractice[] = [
    {
        ok: true,
        text: 'Pair one primary action with quieter secondary ones.',
        component: OnePrimary,
    },
    {
        ok: false,
        text: 'Line up several primary buttons — nothing stands out.',
        component: ManyPrimary,
    },
    {
        ok: true,
        text: 'Use short, sentence-case verbs that say what happens.',
        component: ClearLabel,
    },
    { ok: false, text: 'Use vague or Title Case labels.', component: VagueLabel },
];
