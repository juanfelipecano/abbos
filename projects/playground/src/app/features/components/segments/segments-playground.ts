import { Component, computed } from '@angular/core';
import { AbSegment, AbSegments } from 'abbos';
import { PlaygroundFrame } from '../../../shared/ui/playground-frame/playground-frame';
import { attrs, PlaygroundState } from '../../../shared/ui/playground-frame/playground-state';

@Component({
    selector: 'app-segments-playground',
    imports: [PlaygroundFrame, AbSegments, AbSegment],
    template: `
        <app-playground-frame [model]="state" [code]="code()" fileName="segments-playground.html">
            @let s = state.value();
            <ab-segments
                [value]="s.value"
                (valueChange)="state.write('value', $any($event))"
                [size]="$any(s.size)"
                [shape]="$any(s.shape)"
                [fullWidth]="s.fullWidth"
                [disabled]="s.disabled"
                ariaLabel="Transaction type"
            >
                <ab-segment value="expense">Expense</ab-segment>
                <ab-segment value="income">Income</ab-segment>
                <ab-segment value="transfer">Transfer</ab-segment>
            </ab-segments>
        </app-playground-frame>
    `,
})
export class SegmentsPlayground {
    protected readonly state = new PlaygroundState(
        {
            value: 'expense',
            size: 'md',
            shape: 'circle',
            fullWidth: false,
            disabled: false,
        },
        [
            {
                kind: 'select',
                key: 'value',
                label: 'Value',
                options: ['expense', 'income', 'transfer'],
            },
            { kind: 'select', key: 'size', label: 'Size', options: ['sm', 'md', 'lg'] },
            {
                kind: 'select',
                key: 'shape',
                label: 'Shape',
                options: ['square', 'round', 'circle'],
            },
            { kind: 'toggle', key: 'fullWidth', label: 'Full width' },
            { kind: 'toggle', key: 'disabled', label: 'Disabled' },
        ],
    );

    protected readonly code = computed(() => {
        const s = this.state.value();
        const list = attrs(
            'ab-segments',
            `value="${s.value}"`,
            s.size !== 'md' && `size="${s.size}"`,
            s.shape !== 'circle' && `shape="${s.shape}"`,
            s.fullWidth && 'fullWidth',
            s.disabled && 'disabled',
            'ariaLabel="Transaction type"',
        );
        return [
            `<ab-segments ${list}>`,
            '  <ab-segment value="expense">Expense</ab-segment>',
            '  <ab-segment value="income">Income</ab-segment>',
            '  <ab-segment value="transfer">Transfer</ab-segment>',
            '</ab-segments>',
        ].join('\n');
    });
}
