import { Component, computed, signal } from '@angular/core';
import { AbButton, AbDatePicker, AbDatePickerTrigger, AbDatePickerValue, AbInput } from 'abbos';
import { PlaygroundFrame } from '../../../shared/ui/playground-frame/playground-frame';
import { attrs, PlaygroundState } from '../../../shared/ui/playground-frame/playground-state';

@Component({
    selector: 'app-date-picker-playground',
    imports: [PlaygroundFrame, AbButton, AbInput, AbDatePicker, AbDatePickerTrigger],
    template: `
        <app-playground-frame
            [model]="state"
            [code]="code()"
            fileName="date-picker-playground.html"
        >
            @let s = state.value();
            @if (s.trigger === 'input') {
                <input ab-input aria-label="Date" [abDatePickerTrigger]="picker" />
            } @else {
                <button ab-button variant="outline" [abDatePickerTrigger]="picker">
                    {{ picker.displayText() || 'Pick a date' }}
                </button>
            }
            <ab-date-picker
                #picker
                [(value)]="value"
                [mode]="$any(s.mode)"
                [format]="s.format"
                [shape]="$any(s.shape)"
                [weekStart]="s.weekStart === 'monday' ? 1 : 0"
            />
        </app-playground-frame>
    `,
})
export class DatePickerPlayground {
    protected readonly value = signal<AbDatePickerValue>(null);

    protected readonly state = new PlaygroundState(
        {
            trigger: 'button',
            mode: 'single',
            format: 'dd/MM/yyyy',
            shape: 'circle',
            weekStart: 'monday',
        },
        [
            { kind: 'select', key: 'trigger', label: 'Trigger', options: ['button', 'input'] },
            { kind: 'select', key: 'mode', label: 'Mode', options: ['single', 'range'] },
            {
                kind: 'select',
                key: 'format',
                label: 'Format',
                options: ['dd/MM/yyyy', 'MM/dd/yyyy', 'yyyy-MM-dd', 'd MMM yyyy'],
            },
            {
                kind: 'select',
                key: 'shape',
                label: 'Shape',
                options: ['square', 'round', 'circle'],
            },
            {
                kind: 'select',
                key: 'weekStart',
                label: 'Week starts on',
                options: ['monday', 'sunday'],
            },
        ],
    );

    protected readonly code = computed(() => {
        const s = this.state.value();
        const pickerAttrs = attrs(
            '#picker',
            '[(value)]="value"',
            s.mode !== 'single' && `mode="${s.mode}"`,
            s.format !== 'dd/MM/yyyy' && `format="${s.format}"`,
            s.shape !== 'circle' && `shape="${s.shape}"`,
            s.weekStart !== 'monday' && '[weekStart]="0"',
        );
        const trigger =
            s.trigger === 'input'
                ? '<input ab-input aria-label="Date" [abDatePickerTrigger]="picker" />'
                : `<button ab-button variant="outline" [abDatePickerTrigger]="picker">\n  {{ picker.displayText() || 'Pick a date' }}\n</button>`;
        return `${trigger}\n<ab-date-picker ${pickerAttrs} />`;
    });
}
