import { Component, signal } from '@angular/core';
import { AbButton, AbSkeleton } from 'abbos';
import { ExampleDef } from '../../../../core/docs/doc.model';
import { exampleFiles } from '../../../../shared/docs/example-files';
import card from './skeleton-card.html' with { loader: 'text' };
import loadingRegion from './skeleton-loading-region.html' with { loader: 'text' };
import textLines from './skeleton-text-lines.html' with { loader: 'text' };
import variants from './skeleton-variants.html' with { loader: 'text' };

@Component({
    selector: 'app-skeleton-variants',
    imports: [AbSkeleton],
    templateUrl: './skeleton-variants.html',
    host: { class: 'pg-stack' },
})
export class SkeletonVariants {}

@Component({
    selector: 'app-skeleton-text-lines',
    imports: [AbSkeleton],
    templateUrl: './skeleton-text-lines.html',
    host: { class: 'pg-stack' },
})
export class SkeletonTextLines {}

@Component({
    selector: 'app-skeleton-card',
    imports: [AbSkeleton],
    templateUrl: './skeleton-card.html',
    styles: `
        .card {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .lines {
            flex: 1;
        }
    `,
    host: { class: 'pg-stack' },
})
export class SkeletonCard {}

@Component({
    selector: 'app-skeleton-loading-region',
    imports: [AbSkeleton, AbButton],
    templateUrl: './skeleton-loading-region.html',
    styles: `
        .visually-hidden {
            position: absolute;
            width: 1px;
            height: 1px;
            overflow: hidden;
            clip-path: inset(50%);
            white-space: nowrap;
        }
    `,
    host: { class: 'pg-stack' },
})
export class SkeletonLoadingRegion {
    protected readonly loading = signal(true);
}

export const SKELETON_EXAMPLES: readonly ExampleDef[] = [
    {
        id: 'variants',
        title: 'Variants',
        description:
            'A rectangle for media and blocks, a text bar for copy and a circle for avatars. Give each the size of the content it replaces so the layout does not shift.',
        component: SkeletonVariants,
        files: exampleFiles({
            name: 'skeleton-variants',
            html: variants,
            imports: ['AbSkeleton'],
            layout: 'stack',
        }),
    },
    {
        id: 'text-lines',
        title: 'Text lines and animation',
        description:
            'lines stacks text bars and shortens the last one. pulse is the default, shimmer sweeps a highlight across, and none keeps it static. Both animations stop under prefers-reduced-motion.',
        component: SkeletonTextLines,
        files: exampleFiles({
            name: 'skeleton-text-lines',
            html: textLines,
            imports: ['AbSkeleton'],
            layout: 'stack',
        }),
    },
    {
        id: 'card',
        title: 'Composed layout',
        description: 'Combine skeletons in the same layout as the real card.',
        component: SkeletonCard,
        showCode: true,
        files: exampleFiles({
            name: 'skeleton-card',
            html: card,
            imports: ['AbSkeleton'],
            layout: 'stack',
        }),
    },
    {
        id: 'loading-region',
        title: 'Announce loading',
        description:
            'Skeletons are aria-hidden. Mark the region aria-busy and give screen readers a status message, then swap both for the content.',
        component: SkeletonLoadingRegion,
        showCode: true,
        files: exampleFiles({
            name: 'skeleton-loading-region',
            html: loadingRegion,
            imports: ['AbSkeleton', 'AbButton'],
            core: ['signal'],
            body: '  loading = signal(true);',
            layout: 'stack',
        }),
    },
];
