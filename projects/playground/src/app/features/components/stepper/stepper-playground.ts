import { Component, computed } from '@angular/core';
import { LucideBriefcase, LucideSend, LucideUser } from '@lucide/angular';
import { AbStep, AbStepper } from 'abbos';
import { PlaygroundFrame } from '../../../shared/ui/playground-frame/playground-frame';
import { attrs, PlaygroundState } from '../../../shared/ui/playground-frame/playground-state';

@Component({
    selector: 'app-stepper-playground',
    imports: [PlaygroundFrame, AbStepper, AbStep],
    template: `
        <app-playground-frame [model]="state" [code]="code()" fileName="stepper-playground.html">
            @let s = state.value();
            <ab-stepper
                [value]="s.value"
                (valueChange)="state.write('value', $any($event))"
                [marker]="$any(s.marker)"
                [labels]="s.labels"
                [interactive]="s.interactive"
                style="width: 100%"
            >
                <ab-step
                    value="account"
                    title="Account"
                    caption="Email and password"
                    doneCaption="Email confirmed"
                    [icon]="user"
                />
                <ab-step
                    value="workspace"
                    title="Workspace"
                    caption="Name your workspace"
                    doneCaption="Workspace created"
                    [icon]="briefcase"
                />
                <ab-step
                    value="invite"
                    title="Invite"
                    caption="Add your team"
                    doneCaption="Invites sent"
                    [icon]="send"
                />
            </ab-stepper>
        </app-playground-frame>
    `,
})
export class StepperPlayground {
    protected readonly user = LucideUser;
    protected readonly briefcase = LucideBriefcase;
    protected readonly send = LucideSend;

    protected readonly state = new PlaygroundState(
        { value: 'workspace', marker: 'icon', labels: true, interactive: false },
        [
            {
                kind: 'select',
                key: 'value',
                label: 'Value',
                options: ['account', 'workspace', 'invite'],
            },
            { kind: 'select', key: 'marker', label: 'Marker', options: ['icon', 'number', 'text'] },
            { kind: 'toggle', key: 'labels', label: 'Labels' },
            { kind: 'toggle', key: 'interactive', label: 'Interactive' },
        ],
    );

    protected readonly code = computed(() => {
        const s = this.state.value();
        const list = attrs(
            'ab-stepper',
            `value="${s.value}"`,
            s.marker !== 'icon' && `marker="${s.marker}"`,
            !s.labels && '[labels]="false"',
            s.interactive && 'interactive',
        );
        return [
            `<ab-stepper ${list}>`,
            '  <ab-step value="account" title="Account" caption="Email and password" [icon]="user" />',
            '  <ab-step value="workspace" title="Workspace" caption="Name your workspace" [icon]="briefcase" />',
            '  <ab-step value="invite" title="Invite" caption="Add your team" [icon]="send" />',
            '</ab-stepper>',
        ].join('\n');
    });
}
