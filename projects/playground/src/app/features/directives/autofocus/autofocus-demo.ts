import { Component, signal } from '@angular/core';
import { AbButton } from 'abbos';
import { SampleAutofocus } from './sample-autofocus';

/**
 * Live demo. The field only mounts on Replay, so loading the docs page never steals focus —
 * the same care the directive asks of its users.
 */
@Component({
    selector: 'app-autofocus-demo',
    imports: [AbButton, SampleAutofocus],
    template: `
        <div class="stage pg-dotted">
            <div class="pg-field">
                @for (run of runs(); track run) {
                    <label for="workspace-name">Workspace name</label>
                    <input
                        id="workspace-name"
                        class="native"
                        placeholder="e.g. Abbos Studio"
                        [abAutofocus]="run > 0"
                        [autofocusDelay]="150"
                        (focus)="focused.set(true)"
                        (blur)="focused.set(false)"
                    />
                }
                <small>A plain &lt;input&gt; with abAutofocus — no wrapper component.</small>
            </div>
        </div>
        <div class="bar">
            <span class="status" aria-live="polite">
                <span class="dot" [class.on]="focused()" aria-hidden="true"></span>
                {{ focused() ? 'Focused on render' : 'Not focused — press Replay' }}
            </span>
            <button ab-button variant="ghost" size="sm" (click)="replay()">Replay</button>
        </div>
    `,
    styleUrl: './autofocus-demo.scss',
})
export class AutofocusDemo {
    protected readonly runs = signal([0]);
    protected readonly focused = signal(false);

    protected replay(): void {
        this.focused.set(false);
        this.runs.update(([run]) => [run + 1]);
    }
}
