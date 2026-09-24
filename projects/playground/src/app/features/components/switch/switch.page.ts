import { Component } from '@angular/core';
import { DocPage } from '../../../shared/ui/doc-page/doc-page';
import { SWITCH_DOC } from './switch.doc';
import { SwitchPlayground } from './switch-playground';

@Component({
    selector: 'app-switch-page',
    imports: [DocPage, SwitchPlayground],
    template: `
        <app-doc-page [doc]="doc">
            <app-switch-playground playground />
        </app-doc-page>
    `,
})
export default class SwitchPage {
    protected readonly doc = SWITCH_DOC;
}
