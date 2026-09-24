import { Component, computed } from '@angular/core';
import { AbBottomSheet, AbButton } from 'abbos';
import { PlaygroundFrame } from '../../../shared/ui/playground-frame/playground-frame';
import { attrs, PlaygroundState } from '../../../shared/ui/playground-frame/playground-state';

@Component({
    selector: 'app-bottom-sheet-playground',
    imports: [PlaygroundFrame, AbBottomSheet, AbButton],
    template: `
        <app-playground-frame
            [model]="state"
            [code]="code()"
            fileName="bottom-sheet-playground.html"
        >
            @let s = state.value();
            <button ab-button (click)="state.write('open', true)">
                {{ s.mode === 'modal' ? 'Open sheet' : 'Expand sheet' }}
            </button>
            <ab-bottom-sheet
                [open]="s.open"
                (openChange)="state.write('open', $event)"
                [mode]="$any(s.mode)"
                [heading]="s.heading"
                [subheading]="s.subheading"
                [showHandle]="s.showHandle"
                [dismissible]="s.dismissible"
            >
                <p>Body content goes here.</p>
            </ab-bottom-sheet>
        </app-playground-frame>
    `,
})
export class BottomSheetPlayground {
    protected readonly state = new PlaygroundState(
        {
            mode: 'modal',
            open: false,
            heading: 'Share',
            subheading: '',
            showHandle: true,
            dismissible: true,
        },
        [
            { kind: 'select', key: 'mode', label: 'Mode', options: ['modal', 'standard'] },
            { kind: 'toggle', key: 'open', label: 'Open' },
            { kind: 'text', key: 'heading', label: 'Heading' },
            { kind: 'text', key: 'subheading', label: 'Subheading' },
            { kind: 'toggle', key: 'showHandle', label: 'Handle' },
            { kind: 'toggle', key: 'dismissible', label: 'Dismissible' },
        ],
    );

    protected readonly code = computed(() => {
        const s = this.state.value();
        const list = attrs(
            'ab-bottom-sheet',
            '[(open)]="open"',
            s.mode !== 'modal' && `mode="${s.mode}"`,
            `heading="${s.heading}"`,
            s.subheading && `subheading="${s.subheading}"`,
            !s.showHandle && '[showHandle]="false"',
            !s.dismissible && '[dismissible]="false"',
        );
        return `<${list}>\n  Body content\n</ab-bottom-sheet>`;
    });
}
