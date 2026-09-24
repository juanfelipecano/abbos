import { Component } from '@angular/core';
import { AbSwitch } from 'abbos';
import { DocEntry } from '../../../core/docs/doc.model';

@Component({
    selector: 'app-switch-thumbnail',
    imports: [AbSwitch],
    template: `
        <ab-switch [checked]="true" ariaLabel="On" />
        <ab-switch ariaLabel="Off" />
    `,
    host: { class: 'pg-row' },
})
class SwitchThumbnail {}

export const SWITCH_ENTRY: DocEntry = {
    slug: 'switch',
    category: 'components',
    kind: 'Component',
    title: 'Switch',
    description: 'Turns a single setting on or off, with the change applied right away.',
    status: 'New',
    tags: ['Form'],
    selector: 'ab-switch',
    importNames: ['AbSwitch'],
    sourcePath: 'projects/abbos/src/lib/components/form/switch',
    thumbnail: SwitchThumbnail,
    loadPage: () => import('./switch.page'),
};
