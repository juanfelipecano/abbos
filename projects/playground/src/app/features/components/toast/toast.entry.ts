import { Component } from '@angular/core';
import { DocEntry } from '../../../core/docs/doc.model';

@Component({
    selector: 'app-toast-thumbnail',
    template: `<span class="text">Saved</span><span class="action">Undo</span>`,
    styles: `
        :host {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            width: 128px;
            padding: 8px 12px;
            border-radius: 8px;
            background: var(--ab-text);
            color: var(--ab-surface);
            font-size: 12px;
        }
        .action {
            font-weight: 700;
        }
    `,
})
class ToastThumbnail {}

export const TOAST_ENTRY: DocEntry = {
    slug: 'toast',
    category: 'components',
    kind: 'Component',
    title: 'Toast',
    description: 'A brief, non-blocking message with an optional action, shown from code.',
    status: 'Beta',
    tags: ['Display'],
    selector: 'ab-toast',
    importNames: ['AbToast', 'AbToastController'],
    sourcePath: 'projects/abbos/src/lib/components/toast',
    thumbnail: ToastThumbnail,
    loadPage: () => import('./toast.page'),
};
