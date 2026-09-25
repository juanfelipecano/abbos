import { Component } from '@angular/core';
import {
    LucideCheckCheck,
    LucideCloudOff,
    LucideFolderPlus,
    LucideMessageSquare,
    LucideSearchX,
} from '@lucide/angular';
import { AbButton, AbEmptyState, AbIcon } from 'abbos';
import { ExampleDef } from '../../../../core/docs/doc.model';
import { exampleFiles } from '../../../../shared/docs/example-files';
import compact from './empty-state-compact.html' with { loader: 'text' };
import illustration from './empty-state-illustration.html' with { loader: 'text' };
import variants from './empty-state-variants.html' with { loader: 'text' };

const ICONS_IMPORT =
    "import { LucideCheckCheck, LucideCloudOff, LucideFolderPlus, LucideSearchX } from '@lucide/angular';";

@Component({
    selector: 'app-empty-state-variants',
    imports: [AbEmptyState, AbButton, AbIcon],
    templateUrl: './empty-state-variants.html',
    host: { class: 'pg-stack' },
})
export class EmptyStateVariants {
    protected readonly folderPlus = LucideFolderPlus;
    protected readonly searchX = LucideSearchX;
    protected readonly checkCheck = LucideCheckCheck;
    protected readonly cloudOff = LucideCloudOff;
}

@Component({
    selector: 'app-empty-state-illustration',
    imports: [AbEmptyState, AbButton],
    templateUrl: './empty-state-illustration.html',
    host: { class: 'pg-stack' },
})
export class EmptyStateIllustration {}

@Component({
    selector: 'app-empty-state-compact',
    imports: [AbEmptyState, AbButton, AbIcon],
    templateUrl: './empty-state-compact.html',
    host: { class: 'pg-stack' },
})
export class EmptyStateCompact {
    protected readonly messageSquare = LucideMessageSquare;
}

export const EMPTY_STATE_EXAMPLES: readonly ExampleDef[] = [
    {
        id: 'variants',
        title: 'Match the reason',
        description:
            'First use, no results, all caught up and errors each get their own tone, copy and next step. Lead with the most useful action.',
        component: EmptyStateVariants,
        files: exampleFiles({
            name: 'empty-state-variants',
            html: variants,
            imports: ['AbEmptyState', 'AbButton', 'AbIcon'],
            extraImports: [ICONS_IMPORT],
            body: [
                '  folderPlus = LucideFolderPlus;',
                '  searchX = LucideSearchX;',
                '  checkCheck = LucideCheckCheck;',
                '  cloudOff = LucideCloudOff;',
            ].join('\n'),
            layout: 'stack',
        }),
    },
    {
        id: 'illustration',
        title: 'Custom media',
        description:
            'Project an image or SVG illustration into abMedia instead of an ab-icon. Give it alt text, or hide it with aria-hidden when it is decorative. Anything else you project lands in the body.',
        component: EmptyStateIllustration,
        showCode: true,
        files: exampleFiles({
            name: 'empty-state-illustration',
            html: illustration,
            imports: ['AbEmptyState', 'AbButton'],
            layout: 'stack',
        }),
    },
    {
        id: 'compact',
        title: 'Compact',
        description:
            'size="sm" fits cards, panels and lists. Set headingLevel to keep the page outline valid.',
        component: EmptyStateCompact,
        files: exampleFiles({
            name: 'empty-state-compact',
            html: compact,
            imports: ['AbEmptyState', 'AbButton', 'AbIcon'],
            extraImports: ["import { LucideMessageSquare } from '@lucide/angular';"],
            body: '  messageSquare = LucideMessageSquare;',
            layout: 'stack',
        }),
    },
];
