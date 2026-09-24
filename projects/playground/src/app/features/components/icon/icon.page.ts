import { Component } from '@angular/core';
import { DocPage } from '../../../shared/ui/doc-page/doc-page';
import { ICON_DOC } from './icon.doc';
import { IconPlayground } from './icon-playground';

@Component({
    selector: 'app-icon-page',
    imports: [DocPage, IconPlayground],
    template: `
        <app-doc-page [doc]="doc">
            <app-icon-playground playground />
        </app-doc-page>
    `,
})
export default class IconPage {
    protected readonly doc = ICON_DOC;
}
