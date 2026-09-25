import { Component } from '@angular/core';
import { DocPage } from '../../../shared/ui/doc-page/doc-page';
import { STEPPER_DOC } from './stepper.doc';
import { StepperPlayground } from './stepper-playground';

@Component({
    selector: 'app-stepper-page',
    imports: [DocPage, StepperPlayground],
    template: `
        <app-doc-page [doc]="doc">
            <app-stepper-playground playground />
        </app-doc-page>
    `,
})
export default class StepperPage {
    protected readonly doc = STEPPER_DOC;
}
