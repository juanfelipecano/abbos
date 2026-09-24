import { Component } from '@angular/core';
import { DocPage } from '../../../shared/ui/doc-page/doc-page';
import { BUTTON_DOC } from './button.doc';
import { ButtonPlayground } from './button-playground';

@Component({
    selector: 'app-button-page',
    imports: [DocPage, ButtonPlayground],
    template: `
        <app-doc-page [doc]="doc">
            <app-button-playground playground />
        </app-doc-page>
    `,
})
export default class ButtonPage {
    protected readonly doc = BUTTON_DOC;
}
