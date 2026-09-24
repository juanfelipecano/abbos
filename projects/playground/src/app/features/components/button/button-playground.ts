import { Component, computed } from '@angular/core';
import { AbButton, AbButtonVariant } from 'abbos';
import { PlaygroundFrame } from '../../../shared/ui/playground-frame/playground-frame';
import { attrs, PlaygroundState } from '../../../shared/ui/playground-frame/playground-state';

const VARIANTS: readonly AbButtonVariant[] = [
    'primary',
    'secondary',
    'soft',
    'outline',
    'ghost',
    'danger',
];

@Component({
    selector: 'app-button-playground',
    imports: [PlaygroundFrame, AbButton],
    template: `
        <app-playground-frame [model]="state" [code]="code()" fileName="button-playground.html">
            @let s = state.value();
            <button
                ab-button
                [variant]="$any(s.variant)"
                [size]="$any(s.size)"
                [shape]="$any(s.shape)"
                [disabled]="s.disabled"
                [loading]="s.loading"
            >
                {{ s.label || ' ' }}
            </button>
        </app-playground-frame>
    `,
})
export class ButtonPlayground {
    protected readonly state = new PlaygroundState(
        {
            variant: 'primary',
            size: 'md',
            shape: 'round',
            disabled: false,
            loading: false,
            label: 'Save changes',
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
            { kind: 'toggle', key: 'disabled', label: 'Disabled' },
            { kind: 'toggle', key: 'loading', label: 'Loading' },
            { kind: 'text', key: 'label', label: 'Label' },
        ],
    );

    protected readonly code = computed(() => {
        const s = this.state.value();
        const list = attrs(
            'ab-button',
            s.variant !== 'primary' && `variant="${s.variant}"`,
            s.size !== 'md' && `size="${s.size}"`,
            s.shape !== 'round' && `shape="${s.shape}"`,
            s.disabled && 'disabled',
            s.loading && '[loading]="true"',
        );
        return `<button ${list}>\n  ${s.label}\n</button>`;
    });
}
