import { Component } from '@angular/core';
import { DocPage } from '../../../shared/ui/doc-page/doc-page';
import { TOAST_DOC } from './toast.doc';
import { ToastPlayground } from './toast-playground';

@Component({
    selector: 'app-toast-page',
    imports: [DocPage, ToastPlayground],
    template: `
        <app-doc-page [doc]="doc">
            <app-toast-playground playground />
        </app-doc-page>
    `,
})
export default class ToastPage {
    protected readonly doc = TOAST_DOC;
}
