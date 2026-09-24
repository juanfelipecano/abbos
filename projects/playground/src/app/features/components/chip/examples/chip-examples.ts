import { Component, signal } from '@angular/core';
import { LucideCalendar, LucideMapPin, LucidePaperclip } from '@lucide/angular';
import { AbButton, AbChip } from 'abbos';
import { ExampleDef } from '../../../../core/docs/doc.model';
import { exampleFiles } from '../../../../shared/docs/example-files';
import avatars from './chip-avatars.html' with { loader: 'text' };
import icons from './chip-icons.html' with { loader: 'text' };
import removable from './chip-removable.html' with { loader: 'text' };
import selectable from './chip-selectable.html' with { loader: 'text' };
import shapes from './chip-shapes.html' with { loader: 'text' };
import sizes from './chip-sizes.html' with { loader: 'text' };
import variants from './chip-variants.html' with { loader: 'text' };

const TAGS = ['Design', 'Research', 'Frontend', 'Q4 launch'];

@Component({
    selector: 'app-chip-variants',
    imports: [AbChip],
    templateUrl: './chip-variants.html',
    host: { class: 'pg-row' },
})
export class ChipVariants {}

@Component({
    selector: 'app-chip-sizes',
    imports: [AbChip],
    templateUrl: './chip-sizes.html',
    host: { class: 'pg-row' },
})
export class ChipSizes {}

@Component({
    selector: 'app-chip-shapes',
    imports: [AbChip],
    templateUrl: './chip-shapes.html',
    host: { class: 'pg-row' },
})
export class ChipShapes {}

@Component({
    selector: 'app-chip-icons',
    imports: [AbChip, LucideCalendar, LucideMapPin, LucidePaperclip],
    templateUrl: './chip-icons.html',
    host: { class: 'pg-row' },
})
export class ChipIcons {}

@Component({
    selector: 'app-chip-avatars',
    imports: [AbChip],
    templateUrl: './chip-avatars.html',
    host: { class: 'pg-row' },
})
export class ChipAvatars {}

@Component({
    selector: 'app-chip-removable',
    imports: [AbChip, AbButton],
    templateUrl: './chip-removable.html',
    host: { class: 'pg-stack' },
})
export class ChipRemovable {
    protected readonly tags = signal(TAGS);

    protected remove(tag: string, group: HTMLElement): void {
        this.tags.update((tags) => tags.filter((t) => t !== tag));
        // the focused chip is gone, so park focus on the group instead of losing it
        group.focus();
    }

    protected restore(): void {
        this.tags.set(TAGS);
    }
}

@Component({
    selector: 'app-chip-selectable',
    imports: [AbChip],
    templateUrl: './chip-selectable.html',
})
export class ChipSelectable {
    protected readonly filters = ['Active', 'Shared with me', 'Starred', 'Archived'];
    protected readonly selection: Record<string, boolean> = { Active: true };
}

export const CHIP_EXAMPLES: readonly ExampleDef[] = [
    {
        id: 'variants',
        title: 'Variants',
        description:
            'Neutral for metadata, soft for emphasis, outline for low weight, dotted for placeholders such as a custom value, solid for the active selection.',
        component: ChipVariants,
        files: exampleFiles({ name: 'chip-variants', html: variants, imports: ['AbChip'] }),
    },
    {
        id: 'sizes',
        title: 'Sizes',
        description: '24, 32 and 40px tall.',
        component: ChipSizes,
        files: exampleFiles({ name: 'chip-sizes', html: sizes, imports: ['AbChip'] }),
    },
    {
        id: 'shapes',
        title: 'Shapes',
        description: 'Square, round (8px) or a full pill. Set an app-wide default in provideAbbos.',
        component: ChipShapes,
        files: exampleFiles({ name: 'chip-shapes', html: shapes, imports: ['AbChip'] }),
    },
    {
        id: 'icons',
        title: 'With icon',
        description: 'Project an icon before the label with abStart. Size it to the chip.',
        component: ChipIcons,
        showCode: true,
        files: exampleFiles({
            name: 'chip-icons',
            html: icons,
            imports: ['AbChip'],
            extraImports: [
                "import { LucideCalendar, LucideMapPin, LucidePaperclip } from '@lucide/angular';",
            ],
            extraDeps: ['LucideCalendar', 'LucideMapPin', 'LucidePaperclip'],
        }),
    },
    {
        id: 'avatars',
        title: 'With avatar',
        description:
            'Project initials or an image with abAvatar. Hide it from assistive tech when the label already names the person.',
        component: ChipAvatars,
        files: exampleFiles({ name: 'chip-avatars', html: avatars, imports: ['AbChip'] }),
    },
    {
        id: 'removable',
        title: 'Removable',
        description:
            'Click the x, or focus a chip and press Backspace or Delete. Focus moves to the group so it is not lost.',
        component: ChipRemovable,
        files: exampleFiles({
            name: 'chip-removable',
            html: removable,
            imports: ['AbChip', 'AbButton'],
            core: ['signal'],
            layout: 'stack',
            body: "  tags = signal(['Design', 'Research', 'Frontend', 'Q4 launch']);\n\n  remove(tag: string, group: HTMLElement) {\n    this.tags.update((tags) => tags.filter((t) => t !== tag));\n    // the focused chip is gone, so park focus on the group instead of losing it\n    group.focus();\n  }\n\n  restore() {\n    this.tags.set(['Design', 'Research', 'Frontend', 'Q4 launch']);\n  }",
        }),
    },
    {
        id: 'selectable',
        title: 'Selectable',
        description:
            'Toggle buttons for filters. Two-way bind selected. The active chip turns solid.',
        component: ChipSelectable,
        files: exampleFiles({
            name: 'chip-selectable',
            html: selectable,
            imports: ['AbChip'],
            layout: 'stack',
            body: "  filters = ['Active', 'Shared with me', 'Starred', 'Archived'];\n  selection: Record<string, boolean> = { Active: true };",
        }),
    },
];
