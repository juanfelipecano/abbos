import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AbSwitch } from 'abbos';
import { ExampleDef } from '../../../../core/docs/doc.model';
import { exampleFiles } from '../../../../shared/docs/example-files';
import basic from './switch-basic.html' with { loader: 'text' };
import disabled from './switch-disabled.html' with { loader: 'text' };
import forms from './switch-forms.html' with { loader: 'text' };
import label from './switch-label.html' with { loader: 'text' };
import sizes from './switch-sizes.html' with { loader: 'text' };

const STATUS_STYLES = `
    .status {
        font: var(--ab-text-caption);
        color: var(--ab-text-secondary);
    }
`;

@Component({
    selector: 'app-switch-basic',
    imports: [AbSwitch],
    templateUrl: './switch-basic.html',
    styles: STATUS_STYLES,
    host: { class: 'pg-row' },
})
export class SwitchBasic {
    protected readonly wifi = signal(true);
}

@Component({
    selector: 'app-switch-label',
    imports: [AbSwitch],
    templateUrl: './switch-label.html',
    host: { class: 'pg-stack' },
})
export class SwitchLabel {
    protected readonly email = signal(true);
    protected readonly digest = signal(false);
}

@Component({
    selector: 'app-switch-sizes',
    imports: [AbSwitch],
    templateUrl: './switch-sizes.html',
    host: { class: 'pg-row' },
})
export class SwitchSizes {}

@Component({
    selector: 'app-switch-forms',
    imports: [AbSwitch, ReactiveFormsModule],
    templateUrl: './switch-forms.html',
    styles: STATUS_STYLES,
    host: { class: 'pg-stack' },
})
export class SwitchForms {
    protected readonly marketing = new FormControl(false, { nonNullable: true });
}

@Component({
    selector: 'app-switch-disabled',
    imports: [AbSwitch],
    templateUrl: './switch-disabled.html',
    host: { class: 'pg-row' },
})
export class SwitchDisabled {}

export const SWITCH_EXAMPLES: readonly ExampleDef[] = [
    {
        id: 'basic',
        title: 'Basic',
        description: 'Bind [(checked)] for two-way state. Without visible text, set ariaLabel.',
        component: SwitchBasic,
        files: exampleFiles({
            name: 'switch-basic',
            html: basic,
            imports: ['AbSwitch'],
            core: ['signal'],
            body: '  wifi = signal(true);',
        }),
    },
    {
        id: 'label',
        title: 'With label',
        description: 'Projected text becomes the label — clicking it toggles the switch too.',
        component: SwitchLabel,
        files: exampleFiles({
            name: 'switch-label',
            html: label,
            imports: ['AbSwitch'],
            core: ['signal'],
            body: '  email = signal(true);\n  digest = signal(false);',
            layout: 'stack',
        }),
    },
    {
        id: 'sizes',
        title: 'Sizes',
        description: 'Three sizes to sit next to sm, md and lg controls.',
        component: SwitchSizes,
        files: exampleFiles({ name: 'switch-sizes', html: sizes, imports: ['AbSwitch'] }),
    },
    {
        id: 'forms',
        title: 'In a form',
        description:
            'Implements ControlValueAccessor: formControl, formControlName and ngModel work.',
        component: SwitchForms,
        files: exampleFiles({
            name: 'switch-forms',
            html: forms,
            imports: ['AbSwitch'],
            extraImports: ["import { FormControl, ReactiveFormsModule } from '@angular/forms';"],
            extraDeps: ['ReactiveFormsModule'],
            body: '  marketing = new FormControl(false, { nonNullable: true });',
            layout: 'stack',
        }),
    },
    {
        id: 'disabled',
        title: 'Disabled',
        description:
            'Keeps its state visible but ignores input. A disabled form control does the same.',
        component: SwitchDisabled,
        files: exampleFiles({ name: 'switch-disabled', html: disabled, imports: ['AbSwitch'] }),
    },
];
