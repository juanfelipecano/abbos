import { Component } from '@angular/core';
import { AbSkeleton } from 'abbos';
import { DocEntry } from '../../../core/docs/doc.model';

@Component({
    selector: 'app-skeleton-thumbnail',
    imports: [AbSkeleton],
    template: `
        <ab-skeleton variant="circle" width="32px" />
        <ab-skeleton variant="text" lines="2" animation="shimmer" style="flex: 1" />
    `,
    host: { class: 'pg-row' },
})
class SkeletonThumbnail {}

export const SKELETON_ENTRY: DocEntry = {
    slug: 'skeleton',
    category: 'components',
    kind: 'Component',
    title: 'Skeleton',
    description: 'A placeholder shaped like the content that is still loading.',
    status: 'New',
    tags: ['Display'],
    selector: 'ab-skeleton',
    importNames: ['AbSkeleton'],
    sourcePath: 'projects/abbos/src/lib/components/skeleton',
    thumbnail: SkeletonThumbnail,
    loadPage: () => import('./skeleton.page'),
};
