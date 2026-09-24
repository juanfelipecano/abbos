import { Component } from '@angular/core';
import { DocPage } from '../../../shared/ui/doc-page/doc-page';
import { SEGMENTS_DOC } from './segments.doc';
import { SegmentsPlayground } from './segments-playground';

@Component({
    selector: 'app-segments-page',
    imports: [DocPage, SegmentsPlayground],
    template: `
        <app-doc-page [doc]="doc">
            <app-segments-playground playground />
        </app-doc-page>
    `,
})
export default class SegmentsPage {
    protected readonly doc = SEGMENTS_DOC;
}
