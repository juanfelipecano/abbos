import { Component, computed } from '@angular/core';
import { AbSwitch } from 'abbos';
import { PlaygroundFrame } from '../../../shared/ui/playground-frame/playground-frame';
import { attrs, PlaygroundState } from '../../../shared/ui/playground-frame/playground-state';

@Component({
    selector: 'app-switch-playground',
    imports: [PlaygroundFrame, AbSwitch],
    template: `
        <app-playground-frame [model]="state" [code]="code()" fileName="switch-playground.html">
            @let s = state.value();
            <ab-switch
                [size]="$any(s.size)"
                [shape]="$any(s.shape)"
                [disabled]="s.disabled"
                [checked]="s.checked"
                [ariaLabel]="s.label ? undefined : 'Setting'"
                (checkedChange)="state.write('checked', $event)"
                >{{ s.label }}</ab-switch
            >
        </app-playground-frame>
    `,
})
export class SwitchPlayground {
    protected readonly state = new PlaygroundState(
        {
            size: 'md',
            shape: 'circle',
            checked: true,
            disabled: false,
            label: 'Email notifications',
        },
        [
            { kind: 'select', key: 'size', label: 'Size', options: ['sm', 'md', 'lg'] },
            {
                kind: 'select',
                key: 'shape',
                label: 'Shape',
                options: ['square', 'round', 'circle'],
            },
            { kind: 'toggle', key: 'checked', label: 'Checked' },
            { kind: 'toggle', key: 'disabled', label: 'Disabled' },
            { kind: 'text', key: 'label', label: 'Label' },
        ],
    );

    protected readonly code = computed(() => {
        const s = this.state.value();
        const list = attrs(
            '[(checked)]="enabled"',
            s.size !== 'md' && `size="${s.size}"`,
            s.shape !== 'circle' && `shape="${s.shape}"`,
            s.disabled && 'disabled',
            !s.label && 'ariaLabel="Setting"',
        );
        return s.label
            ? `<ab-switch ${list}>\n  ${s.label}\n</ab-switch>`
            : `<ab-switch ${list} />`;
    });
}
