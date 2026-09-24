import { Component } from '@angular/core';
import { AbSettingsItem, AbSettingsList } from 'abbos';
import { DocEntry } from '../../../core/docs/doc.model';

@Component({
    selector: 'app-settings-list-thumbnail',
    imports: [AbSettingsList, AbSettingsItem],
    template: `
        <ab-settings-list>
            <ab-settings-item label="Currency" value="COP" navigable />
            <ab-settings-item label="Language" value="es-CO" navigable />
        </ab-settings-list>
    `,
    styles: `
        :host {
            display: block;
            width: 240px;
        }
    `,
})
class SettingsListThumbnail {}

export const SETTINGS_LIST_ENTRY: DocEntry = {
    slug: 'settings-list',
    category: 'components',
    kind: 'Component',
    title: 'Settings list',
    description: 'Grouped rows for preferences — each one navigates or hosts an inline control.',
    status: 'Beta',
    tags: ['Display'],
    selector: 'ab-settings-list, ab-settings-item',
    importNames: ['AbSettingsList', 'AbSettingsItem'],
    sourcePath: 'projects/abbos/src/lib/components/settings-list',
    thumbnail: SettingsListThumbnail,
    loadPage: () => import('./settings-list.page'),
};
