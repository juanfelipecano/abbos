import { Component } from '@angular/core';
import { AbCalendar } from 'abbos';
import { DocEntry } from '../../../core/docs/doc.model';

@Component({
    selector: 'app-date-picker-thumbnail',
    imports: [AbCalendar],
    template: `<ab-calendar value="12/03/2026" />`,
    host: { class: 'pg-row' },
})
class DatePickerThumbnail {}

export const DATE_PICKER_ENTRY: DocEntry = {
    slug: 'date-picker',
    category: 'components',
    kind: 'Component',
    title: 'Date picker',
    description:
        'Picks a date or a range, inline or in a dropdown that opens from a button, an input or any clickable.',
    status: 'Beta',
    tags: ['Form'],
    selector: 'ab-date-picker',
    importNames: ['AbDatePicker', 'AbDatePickerTrigger', 'AbCalendar'],
    sourcePath: 'projects/abbos/src/lib/components/form/date-picker',
    thumbnail: DatePickerThumbnail,
    loadPage: () => import('./date-picker.page'),
};
