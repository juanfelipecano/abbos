import { Component } from '@angular/core';
import {
    LucideBell,
    LucideMail,
    LucideShieldCheck,
    LucideTriangleAlert,
    LucideUser,
} from '@lucide/angular';
import { AbIcon } from 'abbos';
import { ExampleDef } from '../../../../core/docs/doc.model';
import { exampleFiles } from '../../../../shared/docs/example-files';
import appearances from './icon-appearances.html' with { loader: 'text' };
import label from './icon-label.html' with { loader: 'text' };
import shapes from './icon-shapes.html' with { loader: 'text' };
import sizes from './icon-sizes.html' with { loader: 'text' };
import tones from './icon-tones.html' with { loader: 'text' };

@Component({
    selector: 'app-icon-tones',
    imports: [AbIcon],
    templateUrl: './icon-tones.html',
    host: { class: 'pg-row' },
})
export class IconTones {
    protected readonly Mail = LucideMail;
}

@Component({
    selector: 'app-icon-appearances',
    imports: [AbIcon],
    templateUrl: './icon-appearances.html',
    host: { class: 'pg-row' },
})
export class IconAppearances {
    protected readonly Bell = LucideBell;
}

@Component({
    selector: 'app-icon-sizes',
    imports: [AbIcon],
    templateUrl: './icon-sizes.html',
    host: { class: 'pg-row' },
})
export class IconSizes {
    protected readonly ShieldCheck = LucideShieldCheck;
}

@Component({
    selector: 'app-icon-shapes',
    imports: [AbIcon],
    templateUrl: './icon-shapes.html',
    host: { class: 'pg-row' },
})
export class IconShapes {
    protected readonly User = LucideUser;
}

@Component({
    selector: 'app-icon-label',
    imports: [AbIcon],
    templateUrl: './icon-label.html',
    host: { class: 'pg-row' },
})
export class IconLabel {
    protected readonly TriangleAlert = LucideTriangleAlert;
}

const lucide = (names: string[]) => ({
    extraImports: [
        `import { ${names.map((n) => `Lucide${n}`).join(', ')} } from '@lucide/angular';`,
    ],
    body: names.map((n) => `  ${n} = Lucide${n};`).join('\n'),
});

export const ICON_EXAMPLES: readonly ExampleDef[] = [
    {
        id: 'tones',
        title: 'Tones',
        description: 'Six semantic colours. success is the default.',
        component: IconTones,
        files: exampleFiles({
            name: 'icon-tones',
            html: tones,
            imports: ['AbIcon'],
            ...lucide(['Mail']),
        }),
    },
    {
        id: 'appearances',
        title: 'Appearances',
        description:
            'soft and solid sit in a filled badge, outline in a ring, clear is the bare glyph.',
        component: IconAppearances,
        files: exampleFiles({
            name: 'icon-appearances',
            html: appearances,
            imports: ['AbIcon'],
            ...lucide(['Bell']),
        }),
    },
    {
        id: 'sizes',
        title: 'Sizes',
        description: 'sm, md, lg and xl — from inline rows to empty-state heroes.',
        component: IconSizes,
        files: exampleFiles({
            name: 'icon-sizes',
            html: sizes,
            imports: ['AbIcon'],
            ...lucide(['ShieldCheck']),
        }),
    },
    {
        id: 'shapes',
        title: 'Shapes',
        description: 'The badge follows the same square, round and circle scale as controls.',
        component: IconShapes,
        files: exampleFiles({
            name: 'icon-shapes',
            html: shapes,
            imports: ['AbIcon'],
            ...lucide(['User']),
        }),
    },
    {
        id: 'label',
        title: 'Meaningful icons',
        description:
            'Icons are decorative by default. Give one a label when it carries meaning on its own.',
        component: IconLabel,
        files: exampleFiles({
            name: 'icon-label',
            html: label,
            imports: ['AbIcon'],
            ...lucide(['TriangleAlert']),
        }),
    },
];
