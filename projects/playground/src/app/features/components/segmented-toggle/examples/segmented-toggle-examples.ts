import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AbSegmentedToggle } from 'abbos';
import { ExampleDef } from '../../../../core/docs/doc.model';
import { exampleFiles } from '../../../../shared/docs/example-files';
import basic from './segmented-toggle-basic.html' with { loader: 'text' };
import disabled from './segmented-toggle-disabled.html' with { loader: 'text' };
import forms from './segmented-toggle-forms.html' with { loader: 'text' };
import shapes from './segmented-toggle-shapes.html' with { loader: 'text' };
import sizes from './segmented-toggle-sizes.html' with { loader: 'text' };

const STATUS_STYLES = `
    .status {
        font: var(--ab-text-caption);
        color: var(--ab-text-secondary);
    }
`;

@Component({
    selector: 'app-segmented-toggle-basic',
    imports: [AbSegmentedToggle],
    templateUrl: './segmented-toggle-basic.html',
    styles: STATUS_STYLES,
    host: { class: 'pg-row' },
})
export class SegmentedToggleBasic {
    protected readonly yearly = signal(false);
}

@Component({
    selector: 'app-segmented-toggle-sizes',
    imports: [AbSegmentedToggle],
    templateUrl: './segmented-toggle-sizes.html',
    host: { class: 'pg-row' },
})
export class SegmentedToggleSizes {}

@Component({
    selector: 'app-segmented-toggle-shapes',
    imports: [AbSegmentedToggle],
    templateUrl: './segmented-toggle-shapes.html',
    host: { class: 'pg-row' },
})
export class SegmentedToggleShapes {}

@Component({
    selector: 'app-segmented-toggle-forms',
    imports: [AbSegmentedToggle, ReactiveFormsModule],
    templateUrl: './segmented-toggle-forms.html',
    styles: STATUS_STYLES,
    host: { class: 'pg-row' },
})
export class SegmentedToggleForms {
    protected readonly fahrenheit = new FormControl(false, { nonNullable: true });
}

@Component({
    selector: 'app-segmented-toggle-disabled',
    imports: [AbSegmentedToggle],
    templateUrl: './segmented-toggle-disabled.html',
    host: { class: 'pg-row' },
})
export class SegmentedToggleDisabled {}

export const SEGMENTED_TOGGLE_EXAMPLES: readonly ExampleDef[] = [
    {
        id: 'basic',
        title: 'Basic',
        description: 'checked is false for the start option and true for the end one.',
        component: SegmentedToggleBasic,
        files: exampleFiles({
            name: 'segmented-toggle-basic',
            html: basic,
            imports: ['AbSegmentedToggle'],
            core: ['signal'],
            body: '  yearly = signal(false);',
        }),
    },
    {
        id: 'sizes',
        title: 'Sizes',
        description: 'Matches the 32, 40 and 48px control heights.',
        component: SegmentedToggleSizes,
        files: exampleFiles({
            name: 'segmented-toggle-sizes',
            html: sizes,
            imports: ['AbSegmentedToggle'],
        }),
    },
    {
        id: 'shapes',
        title: 'Shapes',
        description: 'Pill by default; square and round follow the control shape scale.',
        component: SegmentedToggleShapes,
        files: exampleFiles({
            name: 'segmented-toggle-shapes',
            html: shapes,
            imports: ['AbSegmentedToggle'],
        }),
    },
    {
        id: 'forms',
        title: 'In a form',
        description: 'Implements ControlValueAccessor, so it binds to reactive and template forms.',
        component: SegmentedToggleForms,
        files: exampleFiles({
            name: 'segmented-toggle-forms',
            html: forms,
            imports: ['AbSegmentedToggle'],
            extraImports: ["import { FormControl, ReactiveFormsModule } from '@angular/forms';"],
            extraDeps: ['ReactiveFormsModule'],
            body: '  fahrenheit = new FormControl(false, { nonNullable: true });',
        }),
    },
    {
        id: 'disabled',
        title: 'Disabled',
        description: 'Shows the current choice but ignores clicks, keys and drags.',
        component: SegmentedToggleDisabled,
        files: exampleFiles({
            name: 'segmented-toggle-disabled',
            html: disabled,
            imports: ['AbSegmentedToggle'],
        }),
    },
];
