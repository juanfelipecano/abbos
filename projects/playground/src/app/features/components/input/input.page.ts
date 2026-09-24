import { Component } from '@angular/core';
import { DocPage } from '../../../shared/ui/doc-page/doc-page';
import { INPUT_DOC } from './input.doc';
import { InputPlayground } from './input-playground';

@Component({
    selector: 'app-input-page',
    imports: [DocPage, InputPlayground],
    template: `
        <app-doc-page [doc]="doc">
            <app-input-playground playground />
        </app-doc-page>
    `,
})
export default class InputPage {
    protected readonly doc = INPUT_DOC;
}
