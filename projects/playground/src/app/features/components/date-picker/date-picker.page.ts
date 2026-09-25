import { Component } from '@angular/core';
import { DocPage } from '../../../shared/ui/doc-page/doc-page';
import { DATE_PICKER_DOC } from './date-picker.doc';
import { DatePickerPlayground } from './date-picker-playground';

@Component({
    selector: 'app-date-picker-page',
    imports: [DocPage, DatePickerPlayground],
    template: `
        <app-doc-page [doc]="doc">
            <app-date-picker-playground playground />
        </app-doc-page>
    `,
})
export default class DatePickerPage {
    protected readonly doc = DATE_PICKER_DOC;
}
