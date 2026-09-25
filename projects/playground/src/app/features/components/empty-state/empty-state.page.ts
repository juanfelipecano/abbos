import { Component } from '@angular/core';
import { DocPage } from '../../../shared/ui/doc-page/doc-page';
import { EMPTY_STATE_DOC } from './empty-state.doc';
import { EmptyStatePlayground } from './empty-state-playground';

@Component({
    selector: 'app-empty-state-page',
    imports: [DocPage, EmptyStatePlayground],
    template: `
        <app-doc-page [doc]="doc">
            <app-empty-state-playground playground />
        </app-doc-page>
    `,
})
export default class EmptyStatePage {
    protected readonly doc = EMPTY_STATE_DOC;
}
