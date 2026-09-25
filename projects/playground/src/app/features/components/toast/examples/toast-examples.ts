import { Component, inject, signal } from '@angular/core';
import { AbButton, AbToastController, AbToastMode, AbToastPosition } from 'abbos';
import { firstValueFrom } from 'rxjs';
import { ExampleDef } from '../../../../core/docs/doc.model';
import { exampleFiles } from '../../../../shared/docs/example-files';
import basic from './toast-basic.html' with { loader: 'text' };
import persistent from './toast-persistent.html' with { loader: 'text' };
import positions from './toast-positions.html' with { loader: 'text' };
import queue from './toast-queue.html' with { loader: 'text' };
import stack from './toast-stack.html' with { loader: 'text' };
import undo from './toast-undo.html' with { loader: 'text' };

@Component({
    selector: 'app-toast-basic',
    imports: [AbButton],
    templateUrl: './toast-basic.html',
    host: { class: 'pg-row' },
})
export class ToastBasic {
    protected readonly toasts = inject(AbToastController);
}

@Component({
    selector: 'app-toast-undo',
    imports: [AbButton],
    templateUrl: './toast-undo.html',
})
export class ToastUndo {
    private readonly toasts = inject(AbToastController);
    protected readonly status = signal('Photo kept');

    protected async remove(): Promise<void> {
        this.status.set('Photo deleted');
        const ref = this.toasts.show({ message: 'Photo deleted', actionLabel: 'Undo' });
        const reason = await firstValueFrom(ref.afterDismissed());
        // The action is optional to take, so undo only when the user actually did.
        this.status.set(reason === 'action' ? 'Photo restored' : 'Photo deleted for good');
    }
}

@Component({
    selector: 'app-toast-persistent',
    imports: [AbButton],
    templateUrl: './toast-persistent.html',
    host: { class: 'pg-row' },
})
export class ToastPersistent {
    protected readonly toasts = inject(AbToastController);

    protected show(): void {
        this.toasts.show({ message: 'You are offline', duration: 0, severity: 'info' });
    }
}

@Component({
    selector: 'app-toast-queue',
    imports: [AbButton],
    templateUrl: './toast-queue.html',
    host: { class: 'pg-row' },
})
export class ToastQueue {
    protected readonly toasts = inject(AbToastController);

    protected queue(): void {
        ['First message', 'Second message', 'Third message'].forEach((m) => this.toasts.show(m));
    }
}

@Component({
    selector: 'app-toast-positions',
    imports: [AbButton],
    templateUrl: './toast-positions.html',
    host: { class: 'pg-row' },
})
export class ToastPositions {
    private readonly toasts = inject(AbToastController);

    protected show(position: AbToastPosition): void {
        this.toasts.show({ message: position, position });
    }
}

@Component({
    selector: 'app-toast-stack',
    imports: [AbButton],
    templateUrl: './toast-stack.html',
    host: { class: 'pg-row' },
})
export class ToastStack {
    protected readonly toasts = inject(AbToastController);
    private count = 0;

    protected fire(mode: AbToastMode): void {
        for (let i = 0; i < 4; i++) {
            this.toasts.show({
                message: `Message ${++this.count}`,
                position: 'top-right',
                mode,
                duration: 10_000,
            });
        }
    }
}

export const TOAST_EXAMPLES: readonly ExampleDef[] = [
    {
        id: 'basic',
        title: 'Message and severities',
        description:
            'Inject AbToastController and call show, or success, info and error. Neutral is announced politely; error is announced immediately. Focus never moves.',
        component: ToastBasic,
        files: exampleFiles({
            name: 'toast-basic',
            html: basic,
            imports: ['AbButton', 'AbToastController'],
            core: ['inject'],
            body: '  toasts = inject(AbToastController);',
        }),
    },
    {
        id: 'undo',
        title: 'Action and result',
        description:
            'One text action, and afterDismissed tells you why the toast went away: action, timeout or dismiss. A toast with an action stays 8 seconds instead of 4.',
        component: ToastUndo,
        showCode: true,
        files: exampleFiles({
            name: 'toast-undo',
            html: undo,
            imports: ['AbButton', 'AbToastController'],
            core: ['inject', 'signal'],
            extraImports: ["import { firstValueFrom } from 'rxjs';"],
            body: "  private toasts = inject(AbToastController);\n  status = signal('Photo kept');\n\n  async remove() {\n    this.status.set('Photo deleted');\n    const ref = this.toasts.show({ message: 'Photo deleted', actionLabel: 'Undo' });\n    const reason = await firstValueFrom(ref.afterDismissed());\n    // The action is optional to take, so undo only when the user actually did.\n    this.status.set(reason === 'action' ? 'Photo restored' : 'Photo deleted for good');\n  }",
            layout: 'stack',
        }),
    },
    {
        id: 'persistent',
        title: 'Persistent',
        description:
            'duration: 0 keeps the toast until it is dismissed, and shows a close button so it can always be dismissed. Use it sparingly.',
        component: ToastPersistent,
        files: exampleFiles({
            name: 'toast-persistent',
            html: persistent,
            imports: ['AbButton', 'AbToastController'],
            core: ['inject'],
            body: "  toasts = inject(AbToastController);\n\n  show() {\n    this.toasts.show({ message: 'You are offline', duration: 0, severity: 'info' });\n  }",
        }),
    },
    {
        id: 'queue',
        title: 'Queue',
        description:
            'Only one toast is on screen at a time. The rest wait their turn; dismissAll clears the visible one and the queue.',
        component: ToastQueue,
        files: exampleFiles({
            name: 'toast-queue',
            html: queue,
            imports: ['AbButton', 'AbToastController'],
            core: ['inject'],
            body: "  toasts = inject(AbToastController);\n\n  queue() {\n    ['First message', 'Second message', 'Third message'].forEach((m) => this.toasts.show(m));\n  }",
        }),
    },
    {
        id: 'positions',
        title: 'Position',
        description:
            'Seven places: top, bottom or center, aligned left, center or right. The default is bottom-center. Each position has its own queue, so toasts at different positions show together.',
        component: ToastPositions,
        files: exampleFiles({
            name: 'toast-positions',
            html: positions,
            imports: ['AbButton', 'AbToastController', 'AbToastPosition'],
            core: ['inject'],
            body: '  private toasts = inject(AbToastController);\n\n  show(position: AbToastPosition) {\n    this.toasts.show({ message: position, position });\n  }',
        }),
    },
    {
        id: 'stack',
        title: 'Stacked and expanded',
        description:
            'mode: "stacked" folds up to maxVisible toasts into a pile that fans out while the pointer or keyboard focus is on it. mode: "expanded" always shows them as a list. Both pause every timer while hovered or focused. The rest wait in the queue.',
        component: ToastStack,
        showCode: true,
        files: exampleFiles({
            name: 'toast-stack',
            html: stack,
            imports: ['AbButton', 'AbToastController', 'AbToastMode'],
            core: ['inject'],
            body: "  toasts = inject(AbToastController);\n  private count = 0;\n\n  fire(mode: AbToastMode) {\n    for (let i = 0; i < 4; i++) {\n      this.toasts.show({\n        message: `Message ${++this.count}`,\n        position: 'top-right',\n        mode,\n        duration: 10_000,\n      });\n    }\n  }",
        }),
    },
];
