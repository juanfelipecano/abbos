import { Component, DestroyRef, inject, signal } from '@angular/core';
import { LucideArrowRight, LucideDownload, LucidePlus } from '@lucide/angular';
import { AbButton } from 'abbos';
import { ExampleDef } from '../../../../core/docs/doc.model';
import { exampleFiles } from '../../../../shared/docs/example-files';
import full from './button-full.html' with { loader: 'text' };
import icons from './button-icons.html' with { loader: 'text' };
import shapes from './button-shapes.html' with { loader: 'text' };
import sizes from './button-sizes.html' with { loader: 'text' };
import states from './button-states.html' with { loader: 'text' };
import variants from './button-variants.html' with { loader: 'text' };

@Component({
    selector: 'app-button-variants',
    imports: [AbButton],
    templateUrl: './button-variants.html',
    host: { class: 'pg-row' },
})
export class ButtonVariants {}

@Component({
    selector: 'app-button-sizes',
    imports: [AbButton],
    templateUrl: './button-sizes.html',
    host: { class: 'pg-row' },
})
export class ButtonSizes {}

@Component({
    selector: 'app-button-shapes',
    imports: [AbButton],
    templateUrl: './button-shapes.html',
    host: { class: 'pg-row' },
})
export class ButtonShapes {}

@Component({
    selector: 'app-button-icons',
    imports: [AbButton, LucidePlus, LucideArrowRight, LucideDownload],
    templateUrl: './button-icons.html',
    host: { class: 'pg-row' },
})
export class ButtonIcons {}

@Component({
    selector: 'app-button-states',
    imports: [AbButton],
    templateUrl: './button-states.html',
    host: { class: 'pg-row' },
})
export class ButtonStates {
    private readonly destroyRef = inject(DestroyRef);
    protected readonly saving = signal(false);

    protected save(): void {
        this.saving.set(true);
        const timer = setTimeout(() => this.saving.set(false), 1500);
        this.destroyRef.onDestroy(() => clearTimeout(timer));
    }
}

@Component({
    selector: 'app-button-full',
    imports: [AbButton],
    templateUrl: './button-full.html',
    host: { class: 'pg-stack' },
})
export class ButtonFull {}

export const BUTTON_EXAMPLES: readonly ExampleDef[] = [
    {
        id: 'variants',
        title: 'Variants',
        description: 'Six levels of emphasis. Keep one primary action per view.',
        component: ButtonVariants,
        files: exampleFiles({ name: 'button-variants', html: variants, imports: ['AbButton'] }),
    },
    {
        id: 'sizes',
        title: 'Sizes',
        description: '32, 40 and 48px tall. Match the density of the surrounding UI.',
        component: ButtonSizes,
        files: exampleFiles({ name: 'button-sizes', html: sizes, imports: ['AbButton'] }),
    },
    {
        id: 'shapes',
        title: 'Shapes',
        description: 'Square, round (8px) or a full pill. Set an app-wide default in provideAbbos.',
        component: ButtonShapes,
        files: exampleFiles({ name: 'button-shapes', html: shapes, imports: ['AbButton'] }),
    },
    {
        id: 'icons',
        title: 'With icon',
        description: 'Project an icon before or after the label with abStart and abEnd.',
        component: ButtonIcons,
        showCode: true,
        files: exampleFiles({
            name: 'button-icons',
            html: icons,
            imports: ['AbButton'],
            extraImports: [
                "import { LucideArrowRight, LucideDownload, LucidePlus } from '@lucide/angular';",
            ],
            extraDeps: ['LucidePlus', 'LucideArrowRight', 'LucideDownload'],
        }),
    },
    {
        id: 'states',
        title: 'Loading and disabled',
        description:
            'Loading shows a spinner and blocks repeat clicks. Click “Save changes” to try it.',
        component: ButtonStates,
        files: exampleFiles({
            name: 'button-states',
            html: states,
            imports: ['AbButton'],
            core: ['signal'],
            body: '  saving = signal(false);\n\n  save() {\n    this.saving.set(true);\n    // …persist, then this.saving.set(false)\n  }',
        }),
    },
    {
        id: 'full',
        title: 'Full width',
        description: 'Stretches to fill its container — handy in narrow forms and sheets.',
        component: ButtonFull,
        files: exampleFiles({
            name: 'button-full',
            html: full,
            imports: ['AbButton'],
            layout: 'stack',
        }),
    },
];
