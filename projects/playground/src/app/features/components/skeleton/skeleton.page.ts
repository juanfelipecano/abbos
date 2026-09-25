import { Component } from '@angular/core';
import { DocPage } from '../../../shared/ui/doc-page/doc-page';
import { SKELETON_DOC } from './skeleton.doc';
import { SkeletonPlayground } from './skeleton-playground';

@Component({
    selector: 'app-skeleton-page',
    imports: [DocPage, SkeletonPlayground],
    template: `
        <app-doc-page [doc]="doc">
            <app-skeleton-playground playground />
        </app-doc-page>
    `,
})
export default class SkeletonPage {
    protected readonly doc = SKELETON_DOC;
}
