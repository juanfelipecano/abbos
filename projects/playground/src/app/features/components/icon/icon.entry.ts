import { Component } from '@angular/core';
import { LucideBell, LucideShieldCheck } from '@lucide/angular';
import { AbIcon } from 'abbos';
import { DocEntry } from '../../../core/docs/doc.model';

@Component({
    selector: 'app-icon-thumbnail',
    imports: [AbIcon],
    template: `
        <ab-icon [icon]="shield" tone="primary" appearance="soft" size="md" />
        <ab-icon [icon]="bell" tone="info" appearance="solid" size="md" />
    `,
    host: { class: 'pg-row' },
})
class IconThumbnail {
    protected readonly shield = LucideShieldCheck;
    protected readonly bell = LucideBell;
}

export const ICON_ENTRY: DocEntry = {
    slug: 'icon',
    category: 'components',
    kind: 'Component',
    title: 'Icon',
    description: 'A Lucide icon with tone, appearance and shape — bare or inside a soft badge.',
    status: 'New',
    tags: ['Display'],
    selector: 'ab-icon',
    importNames: ['AbIcon'],
    sourcePath: 'projects/abbos/src/lib/components/icon',
    thumbnail: IconThumbnail,
    loadPage: () => import('./icon.page'),
};
