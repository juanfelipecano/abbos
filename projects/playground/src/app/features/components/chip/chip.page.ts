import { Component } from '@angular/core';
import { DocPage } from '../../../shared/ui/doc-page/doc-page';
import { CHIP_DOC } from './chip.doc';
import { ChipPlayground } from './chip-playground';

@Component({
    selector: 'app-chip-page',
    imports: [DocPage, ChipPlayground],
    template: `
        <app-doc-page [doc]="doc">
            <app-chip-playground playground />
        </app-doc-page>
    `,
})
export default class ChipPage {
    protected readonly doc = CHIP_DOC;
}
