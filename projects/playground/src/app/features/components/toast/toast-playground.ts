import { Component, computed, inject } from '@angular/core';
import { AbButton, AbToastController, AbToastMode, AbToastPosition } from 'abbos';
import { PlaygroundFrame } from '../../../shared/ui/playground-frame/playground-frame';
import { PlaygroundState } from '../../../shared/ui/playground-frame/playground-state';

@Component({
    selector: 'app-toast-playground',
    imports: [PlaygroundFrame, AbButton],
    template: `
        <app-playground-frame [model]="state" [code]="code()" fileName="toast-playground.ts">
            <button ab-button (click)="show()">Show toast</button>
        </app-playground-frame>
    `,
})
export class ToastPlayground {
    private readonly toasts = inject(AbToastController);

    protected readonly state = new PlaygroundState(
        {
            message: 'Conversation archived',
            actionLabel: 'Undo',
            severity: 'neutral',
            position: 'bottom-center',
            mode: 'queue',
            maxVisible: '3',
            persistent: false,
            dismissible: false,
        },
        [
            { kind: 'text', key: 'message', label: 'Message' },
            { kind: 'text', key: 'actionLabel', label: 'Action label' },
            {
                kind: 'select',
                key: 'severity',
                label: 'Severity',
                options: ['neutral', 'success', 'info', 'error'],
            },
            {
                kind: 'select',
                key: 'position',
                label: 'Position',
                options: [
                    'top-left',
                    'top-center',
                    'top-right',
                    'bottom-left',
                    'bottom-center',
                    'bottom-right',
                    'center',
                ],
            },
            {
                kind: 'select',
                key: 'mode',
                label: 'Mode',
                options: ['queue', 'stacked', 'expanded'],
            },
            {
                kind: 'select',
                key: 'maxVisible',
                label: 'Max visible',
                options: ['2', '3', '4', '5'],
            },
            { kind: 'toggle', key: 'persistent', label: 'Persistent' },
            { kind: 'toggle', key: 'dismissible', label: 'Close button' },
        ],
    );

    protected readonly code = computed(() => {
        const s = this.state.value();
        const lines = [
            `message: '${s.message}'`,
            s.actionLabel && `actionLabel: '${s.actionLabel}'`,
            s.severity !== 'neutral' && `severity: '${s.severity}'`,
            s.position !== 'bottom-center' && `position: '${s.position}'`,
            s.mode !== 'queue' && `mode: '${s.mode}'`,
            s.mode !== 'queue' && s.maxVisible !== '3' && `maxVisible: ${s.maxVisible}`,
            s.persistent && 'duration: 0',
            s.dismissible && 'dismissible: true',
        ].filter(Boolean);
        return `this.toasts.show({\n  ${lines.join(',\n  ')},\n});`;
    });

    protected show(): void {
        const s = this.state.value();
        this.toasts.show({
            message: s.message,
            actionLabel: s.actionLabel || undefined,
            severity: s.severity as 'neutral' | 'success' | 'info' | 'error',
            position: s.position as AbToastPosition,
            mode: s.mode as AbToastMode,
            maxVisible: Number(s.maxVisible),
            duration: s.persistent ? 0 : undefined,
            dismissible: s.dismissible || undefined,
        });
    }
}
