import { Component, computed } from '@angular/core';
import { AbSegmentedToggle } from 'abbos';
import { PlaygroundFrame } from '../../../shared/ui/playground-frame/playground-frame';
import { PlaygroundState } from '../../../shared/ui/playground-frame/playground-state';

@Component({
    selector: 'app-segmented-toggle-playground',
    imports: [PlaygroundFrame, AbSegmentedToggle],
    template: `
        <app-playground-frame
            [model]="state"
            [code]="code()"
            fileName="segmented-toggle-playground.html"
        >
            @let s = state.value();
            <ab-segmented-toggle
                ariaLabel="Billing period"
                [startLabel]="s.startLabel"
                [endLabel]="s.endLabel"
                [size]="$any(s.size)"
                [shape]="$any(s.shape)"
                [disabled]="s.disabled"
                [checked]="s.checked"
                (checkedChange)="state.write('checked', $event)"
            />
        </app-playground-frame>
    `,
})
export class SegmentedTogglePlayground {
    protected readonly state = new PlaygroundState(
        {
            size: 'md',
            shape: 'circle',
            startLabel: 'Monthly',
            endLabel: 'Yearly',
            checked: false,
            disabled: false,
        },
        [
            { kind: 'select', key: 'size', label: 'Size', options: ['sm', 'md', 'lg'] },
            {
                kind: 'select',
                key: 'shape',
                label: 'Shape',
                options: ['square', 'round', 'circle'],
            },
            { kind: 'text', key: 'startLabel', label: 'Start label' },
            { kind: 'text', key: 'endLabel', label: 'End label' },
            { kind: 'toggle', key: 'checked', label: 'End selected' },
            { kind: 'toggle', key: 'disabled', label: 'Disabled' },
        ],
    );

    protected readonly code = computed(() => {
        const s = this.state.value();
        const lines = [
            `startLabel="${s.startLabel}"`,
            `endLabel="${s.endLabel}"`,
            'ariaLabel="Billing period"',
            '[(checked)]="yearly"',
            s.size !== 'md' && `size="${s.size}"`,
            s.shape !== 'circle' && `shape="${s.shape}"`,
            s.disabled && 'disabled',
        ].filter(Boolean);
        return `<ab-segmented-toggle\n  ${lines.join('\n  ')}\n/>`;
    });
}
