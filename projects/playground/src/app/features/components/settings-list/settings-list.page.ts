import { Component } from '@angular/core';
import { DocPage } from '../../../shared/ui/doc-page/doc-page';
import { SETTINGS_LIST_DOC } from './settings-list.doc';
import { SettingsListPlayground } from './settings-list-playground';

@Component({
    selector: 'app-settings-list-page',
    imports: [DocPage, SettingsListPlayground],
    template: `
        <app-doc-page [doc]="doc">
            <app-settings-list-playground playground />
        </app-doc-page>
    `,
})
export default class SettingsListPage {
    protected readonly doc = SETTINGS_LIST_DOC;
}
