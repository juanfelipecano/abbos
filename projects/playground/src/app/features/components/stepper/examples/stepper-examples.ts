import { Component, signal } from '@angular/core';
import { LucideBriefcase, LucideSend, LucideUser } from '@lucide/angular';
import { AbButton, AbStep, AbStepContent, AbStepper } from 'abbos';
import { ExampleDef } from '../../../../core/docs/doc.model';
import { exampleFiles } from '../../../../shared/docs/example-files';
import flow from './stepper-flow.html' with { loader: 'text' };
import interactive from './stepper-interactive.html' with { loader: 'text' };
import markers from './stepper-markers.html' with { loader: 'text' };

const ICONS = `
    protected readonly user = LucideUser;
    protected readonly briefcase = LucideBriefcase;
    protected readonly send = LucideSend;
`;

@Component({
    selector: 'app-stepper-markers',
    imports: [AbStepper, AbStep],
    templateUrl: './stepper-markers.html',
    host: { class: 'pg-stack' },
})
export class StepperMarkers {
    protected readonly user = LucideUser;
    protected readonly briefcase = LucideBriefcase;
    protected readonly send = LucideSend;
}

@Component({
    selector: 'app-stepper-flow',
    imports: [AbStepper, AbStep, AbStepContent, AbButton],
    templateUrl: './stepper-flow.html',
    styles: `
        .actions {
            display: flex;
            justify-content: space-between;
            margin-top: 16px;
        }
    `,
    host: { class: 'pg-stack' },
})
export class StepperFlow {
    protected readonly user = LucideUser;
    protected readonly briefcase = LucideBriefcase;
    protected readonly send = LucideSend;
    protected readonly step = signal<string | null>('account');
    protected readonly done = signal(false);
}

@Component({
    selector: 'app-stepper-interactive',
    imports: [AbStepper, AbStep],
    templateUrl: './stepper-interactive.html',
    styles: `
        .status {
            font: var(--ab-text-caption);
            color: var(--ab-text-secondary);
        }
    `,
    host: { class: 'pg-stack' },
})
export class StepperInteractive {
    protected readonly step = signal<string | null>('payment');
}

export const STEPPER_EXAMPLES: readonly ExampleDef[] = [
    {
        id: 'markers',
        title: 'Markers',
        description:
            'Icons suit short, recognisable steps. Numbers suit long or generic flows. Text suits steps that need a name.',
        component: StepperMarkers,
        files: exampleFiles({
            name: 'stepper-markers',
            html: markers,
            imports: ['AbStepper', 'AbStep'],
            extraImports: [
                "import { LucideBriefcase, LucideSend, LucideUser } from '@lucide/angular';",
            ],
            body: ICONS.trimEnd().replace(/^ {4}/gm, '  '),
            layout: 'stack',
        }),
    },
    {
        id: 'flow',
        title: 'Switching content',
        description:
            'Like segments, put an abStepContent template in a step and it renders below the stepper while active. Drive it with next() and back(); complete marks every step done.',
        component: StepperFlow,
        showCode: true,
        files: exampleFiles({
            name: 'stepper-flow',
            html: flow,
            imports: ['AbStepper', 'AbStep', 'AbStepContent', 'AbButton'],
            core: ['signal'],
            extraImports: [
                "import { LucideBriefcase, LucideSend, LucideUser } from '@lucide/angular';",
            ],
            body: [
                ICONS.trimEnd().replace(/^ {4}/gm, '  '),
                "  step = signal<string | null>('account');",
                '  done = signal(false);',
            ].join('\n'),
            layout: 'stack',
        }),
    },
    {
        id: 'interactive',
        title: 'Interactive',
        description:
            'With interactive, completed steps become buttons so people can go back. Later steps stay locked.',
        component: StepperInteractive,
        files: exampleFiles({
            name: 'stepper-interactive',
            html: interactive,
            imports: ['AbStepper', 'AbStep'],
            core: ['signal'],
            body: "  step = signal<string | null>('payment');",
            layout: 'stack',
        }),
    },
];
