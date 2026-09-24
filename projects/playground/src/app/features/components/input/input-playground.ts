import { Component, computed } from '@angular/core';
import { AbInput } from 'abbos';
import { PlaygroundFrame } from '../../../shared/ui/playground-frame/playground-frame';
import { attrs, PlaygroundState } from '../../../shared/ui/playground-frame/playground-state';

@Component({
    selector: 'app-input-playground',
    imports: [PlaygroundFrame, AbInput],
    template: `
        <app-playground-frame [model]="state" [code]="code()" fileName="input-playground.html">
            @let s = state.value();
            <div class="pg-field">
                <label for="pg-input">{{ s.label }}</label>
                <input
                    ab-input
                    id="pg-input"
                    [size]="$any(s.size)"
                    [shape]="$any(s.shape)"
                    [placeholder]="s.placeholder"
                    [invalid]="s.invalid"
                    [disabled]="s.disabled"
                    [attr.aria-invalid]="s.invalid || null"
                />
            </div>
        </app-playground-frame>
    `,
})
export class InputPlayground {
    protected readonly state = new PlaygroundState(
        {
            size: 'md',
            shape: 'round',
            label: 'Email',
            placeholder: 'you@company.com',
            invalid: false,
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
            { kind: 'text', key: 'label', label: 'Label' },
            { kind: 'text', key: 'placeholder', label: 'Placeholder' },
            { kind: 'toggle', key: 'invalid', label: 'Invalid' },
            { kind: 'toggle', key: 'disabled', label: 'Disabled' },
        ],
    );

    protected readonly code = computed(() => {
        const s = this.state.value();
        const list = attrs(
            'ab-input',
            'id="email"',
            s.size !== 'md' && `size="${s.size}"`,
            s.shape !== 'round' && `shape="${s.shape}"`,
            s.placeholder && `placeholder="${s.placeholder}"`,
            s.invalid && 'invalid aria-invalid="true"',
            s.disabled && 'disabled',
        );
        return `<label for="email">${s.label}</label>\n<input ${list} />`;
    });
}
