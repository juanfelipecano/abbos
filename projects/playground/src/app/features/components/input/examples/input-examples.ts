import { Component, signal } from '@angular/core';
import { email, form, FormField, provideSignalFormsConfig, required } from '@angular/forms/signals';
import { NG_STATUS_CLASSES } from '@angular/forms/signals/compat';
import { AbInput } from 'abbos';
import { ExampleDef } from '../../../../core/docs/doc.model';
import { exampleFiles } from '../../../../shared/docs/example-files';
import basic from './input-basic.html' with { loader: 'text' };
import shapes from './input-shapes.html' with { loader: 'text' };
import sizes from './input-sizes.html' with { loader: 'text' };
import states from './input-states.html' with { loader: 'text' };
import validation from './input-validation.html' with { loader: 'text' };

// Example templates use a plain `.field` wrapper; the playground styles it through `pg-field`.
const FIELD_STYLES = `
    .field {
        display: grid;
        gap: 6px;
    }
    label {
        font: var(--ab-text-label);
    }
    small {
        font: var(--ab-text-caption);
        color: var(--ab-text-tertiary);
    }
    small.error {
        color: var(--ab-danger);
    }
`;

@Component({
    selector: 'app-input-basic',
    imports: [AbInput],
    templateUrl: './input-basic.html',
    styles: FIELD_STYLES,
    host: { class: 'pg-stack' },
})
export class InputBasic {}

@Component({
    selector: 'app-input-sizes',
    imports: [AbInput],
    templateUrl: './input-sizes.html',
    host: { class: 'pg-stack' },
})
export class InputSizes {}

@Component({
    selector: 'app-input-shapes',
    imports: [AbInput],
    templateUrl: './input-shapes.html',
    host: { class: 'pg-stack' },
})
export class InputShapes {}

@Component({
    selector: 'app-input-validation',
    imports: [AbInput, FormField],
    templateUrl: './input-validation.html',
    styles: FIELD_STYLES,
    // Usually app-wide in app.config.ts; scoped here to keep the example self-contained.
    providers: [provideSignalFormsConfig({ classes: NG_STATUS_CLASSES })],
    host: { class: 'pg-stack' },
})
export class InputValidation {
    private readonly model = signal({ email: 'rafi@abbos' });
    protected readonly signup = form(this.model, (path) => {
        required(path.email);
        email(path.email);
    });

    constructor() {
        // Start touched so the error state is visible right away.
        this.signup.email().markAsTouched();
    }
}

@Component({
    selector: 'app-input-states',
    imports: [AbInput],
    templateUrl: './input-states.html',
    styles: FIELD_STYLES,
    host: { class: 'pg-stack' },
})
export class InputStates {}

export const INPUT_EXAMPLES: readonly ExampleDef[] = [
    {
        id: 'basic',
        title: 'Basic',
        description:
            'AbInput renders no label. Pair it with a visible <label for> and link hints with aria-describedby.',
        component: InputBasic,
        files: exampleFiles({
            name: 'input-basic',
            html: basic,
            imports: ['AbInput'],
            layout: 'stack',
        }),
    },
    {
        id: 'sizes',
        title: 'Sizes',
        description: '32, 40 and 48px tall — the same scale as Button.',
        component: InputSizes,
        files: exampleFiles({
            name: 'input-sizes',
            html: sizes,
            imports: ['AbInput'],
            layout: 'stack',
        }),
    },
    {
        id: 'shapes',
        title: 'Shapes',
        description: 'Square, round or pill corners. Set an app-wide default in provideAbbos.',
        component: InputShapes,
        files: exampleFiles({
            name: 'input-shapes',
            html: shapes,
            imports: ['AbInput'],
            layout: 'stack',
        }),
    },
    {
        id: 'validation',
        title: 'Validation with Signal Forms',
        description:
            'AbInput styles ng-invalid.ng-touched. Signal Forms adds those classes once you provide NG_STATUS_CLASSES; reactive forms add them on their own. Or bind [invalid] yourself.',
        component: InputValidation,
        files: exampleFiles({
            name: 'input-validation',
            html: validation,
            imports: ['AbInput'],
            core: ['signal'],
            extraImports: [
                "import { email, form, FormField, provideSignalFormsConfig, required } from '@angular/forms/signals';",
                "import { NG_STATUS_CLASSES } from '@angular/forms/signals/compat';",
            ],
            providers: 'provideSignalFormsConfig({ classes: NG_STATUS_CLASSES })',
            extraDeps: ['FormField'],
            body: "  private model = signal({ email: '' });\n\n  signup = form(this.model, (path) => {\n    required(path.email);\n    email(path.email);\n  });",
            layout: 'stack',
        }),
    },
    {
        id: 'states',
        title: 'Disabled and read-only',
        description:
            'Native disabled and readonly attributes are styled; nothing extra to wire up.',
        component: InputStates,
        files: exampleFiles({
            name: 'input-states',
            html: states,
            imports: ['AbInput'],
            layout: 'stack',
        }),
    },
];
