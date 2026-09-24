import { Component } from '@angular/core';
import { AbButton } from 'abbos';
import { DocEntry } from '../../../core/docs/doc.model';

@Component({
    selector: 'app-button-thumbnail',
    imports: [AbButton],
    template: `
        <button ab-button size="sm" tabindex="-1">Primary</button>
        <button ab-button size="sm" variant="soft" tabindex="-1">Soft</button>
    `,
    host: { class: 'pg-row' },
})
class ButtonThumbnail {}

export const BUTTON_ENTRY: DocEntry = {
    slug: 'button',
    category: 'components',
    kind: 'Component',
    title: 'Button',
    description: 'Triggers an action, like saving a form or opening a dialog.',
    status: 'New',
    tags: ['Actions'],
    selector: 'button[ab-button]',
    importNames: ['AbButton'],
    sourcePath: 'projects/abbos/src/lib/components/button',
    thumbnail: ButtonThumbnail,
    loadPage: () => import('./button.page'),
};
