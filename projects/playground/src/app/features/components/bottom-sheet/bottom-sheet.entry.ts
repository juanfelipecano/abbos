import { Component } from '@angular/core';
import { DocEntry } from '../../../core/docs/doc.model';

@Component({
    selector: 'app-bottom-sheet-thumbnail',
    template: `<span class="pill"></span>`,
    styles: `
        :host {
            display: flex;
            justify-content: center;
            width: 96px;
            padding-top: 8px;
            height: 40px;
            border: 1px solid var(--ab-border);
            border-bottom: 0;
            border-radius: 12px 12px 0 0;
            background: var(--ab-surface);
        }
        .pill {
            width: 24px;
            height: 4px;
            border-radius: 9999px;
            background: var(--ab-border-strong);
        }
    `,
})
class BottomSheetThumbnail {}

export const BOTTOM_SHEET_ENTRY: DocEntry = {
    slug: 'bottom-sheet',
    category: 'components',
    kind: 'Component',
    title: 'Bottom sheet',
    description: 'A surface anchored to the bottom edge for secondary actions and content.',
    status: 'Beta',
    tags: ['Display'],
    selector: 'ab-bottom-sheet',
    importNames: ['AbBottomSheet', 'AbSheetFooter', 'AbBottomSheetController'],
    sourcePath: 'projects/abbos/src/lib/components/bottom-sheet',
    thumbnail: BottomSheetThumbnail,
    loadPage: () => import('./bottom-sheet.page'),
};
