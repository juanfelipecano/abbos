import { Component } from '@angular/core';
import { DocPage } from '../../../shared/ui/doc-page/doc-page';
import { BOTTOM_SHEET_DOC } from './bottom-sheet.doc';
import { BottomSheetPlayground } from './bottom-sheet-playground';

@Component({
    selector: 'app-bottom-sheet-page',
    imports: [DocPage, BottomSheetPlayground],
    template: `
        <app-doc-page [doc]="doc">
            <app-bottom-sheet-playground playground />
        </app-doc-page>
    `,
})
export default class BottomSheetPage {
    protected readonly doc = BOTTOM_SHEET_DOC;
}
