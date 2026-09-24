import { Component, computed } from '@angular/core';
import { AbChip, AbChipVariant } from 'abbos';
import { PlaygroundFrame } from '../../../shared/ui/playground-frame/playground-frame';
import { attrs, PlaygroundState } from '../../../shared/ui/playground-frame/playground-state';

const VARIANTS: readonly AbChipVariant[] = ['neutral', 'soft', 'outline', 'dotted', 'solid'];

@Component({
    selector: 'app-chip-playground',
    imports: [PlaygroundFrame, AbChip],
    template: `
        <app-playground-frame [model]="state" [code]="code()" fileName="chip-playground.html">
            @let s = state.value();
            <ab-chip
                [variant]="$any(s.variant)"
                [size]="$any(s.size)"
                [shape]="$any(s.shape)"
                [removable]="s.removable"
                [selectable]="s.selectable"
                [selected]="s.selected"
                (selectedChange)="state.write('selected', $event)"
                [disabled]="s.disabled"
            >
                {{ s.label || ' ' }}
            </ab-chip>
        </app-playground-frame>
    `,
})
export class ChipPlayground {
    protected readonly state = new PlaygroundState(
        {
            variant: 'neutral',
            size: 'md',
            shape: 'round',
            removable: false,
            selectable: false,
            selected: false,
            disabled: false,
            label: 'Design',
        },
        [
            { kind: 'select', key: 'variant', label: 'Variant', options: VARIANTS },
            { kind: 'select', key: 'size', label: 'Size', options: ['sm', 'md', 'lg'] },
            {
                kind: 'select',
                key: 'shape',
                label: 'Shape',
                options: ['square', 'round', 'circle'],
            },
            { kind: 'toggle', key: 'removable', label: 'Removable' },
            { kind: 'toggle', key: 'selectable', label: 'Selectable' },
            { kind: 'toggle', key: 'selected', label: 'Selected' },
            { kind: 'toggle', key: 'disabled', label: 'Disabled' },
            { kind: 'text', key: 'label', label: 'Label' },
        ],
    );

    protected readonly code = computed(() => {
        const s = this.state.value();
        const list = attrs(
            'ab-chip',
            s.variant !== 'neutral' && `variant="${s.variant}"`,
            s.size !== 'md' && `size="${s.size}"`,
            s.shape !== 'round' && `shape="${s.shape}"`,
            s.removable && 'removable',
            s.selectable && 'selectable',
            s.selectable && s.selected && '[selected]="true"',
            s.disabled && 'disabled',
        );
        return `<${list}>${s.label}</ab-chip>`;
    });
}
