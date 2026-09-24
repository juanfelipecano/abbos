import { Component } from '@angular/core';
import { DocPage } from '../../../shared/ui/doc-page/doc-page';
import { SEGMENTED_TOGGLE_DOC } from './segmented-toggle.doc';
import { SegmentedTogglePlayground } from './segmented-toggle-playground';

@Component({
    selector: 'app-segmented-toggle-page',
    imports: [DocPage, SegmentedTogglePlayground],
    template: `
        <app-doc-page [doc]="doc">
            <app-segmented-toggle-playground playground />
        </app-doc-page>
    `,
})
export default class SegmentedTogglePage {
    protected readonly doc = SEGMENTED_TOGGLE_DOC;
}
