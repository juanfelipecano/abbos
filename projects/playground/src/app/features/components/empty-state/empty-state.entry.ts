import { Component } from '@angular/core';
import { LucideFolderPlus } from '@lucide/angular';
import { AbButton, AbEmptyState, AbIcon } from 'abbos';
import { DocEntry } from '../../../core/docs/doc.model';

@Component({
    selector: 'app-empty-state-thumbnail',
    imports: [AbEmptyState, AbButton, AbIcon],
    template: `
        <ab-empty-state title="No projects yet" description="Start one to get going." size="sm">
            <ab-icon abMedia [icon]="icon" tone="primary" appearance="soft" size="md" />
            <button ab-button abActions size="sm">New project</button>
        </ab-empty-state>
    `,
    host: { class: 'pg-row' },
})
class EmptyStateThumbnail {
    protected readonly icon = LucideFolderPlus;
}

export const EMPTY_STATE_ENTRY: DocEntry = {
    slug: 'empty-state',
    category: 'components',
    kind: 'Component',
    title: 'Empty state',
    description: 'Explains why a view is empty and offers the next step.',
    status: 'New',
    tags: ['Display'],
    selector: 'ab-empty-state',
    importNames: ['AbEmptyState'],
    sourcePath: 'projects/abbos/src/lib/components/empty-state',
    thumbnail: EmptyStateThumbnail,
    loadPage: () => import('./empty-state.page'),
};
