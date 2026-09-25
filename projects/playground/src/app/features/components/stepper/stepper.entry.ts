import { Component } from '@angular/core';
import { AbStep, AbStepper } from 'abbos';
import { DocEntry } from '../../../core/docs/doc.model';

@Component({
    selector: 'app-stepper-thumbnail',
    imports: [AbStepper, AbStep],
    template: `
        <ab-stepper value="b" marker="number" [labels]="false" style="width: 200px">
            <ab-step value="a" title="Account" />
            <ab-step value="b" title="Profile" />
            <ab-step value="c" title="Invite" />
        </ab-stepper>
    `,
    host: { class: 'pg-row' },
})
class StepperThumbnail {}

export const STEPPER_ENTRY: DocEntry = {
    slug: 'stepper',
    category: 'components',
    kind: 'Component',
    title: 'Stepper',
    description:
        'Shows progress through a multi-step flow, and optionally the content of each step.',
    status: 'New',
    tags: ['Display'],
    selector: 'ab-stepper',
    importNames: ['AbStepper', 'AbStep', 'AbStepContent'],
    sourcePath: 'projects/abbos/src/lib/components/stepper',
    thumbnail: StepperThumbnail,
    loadPage: () => import('./stepper.page'),
};
