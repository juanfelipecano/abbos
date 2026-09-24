import { Component, computed, signal } from '@angular/core';
import { AbInput } from 'abbos';
import { StatusBadge } from '../../../shared/ui/status-badge/status-badge';
import { truncate } from './sample-truncate';

/** Live "Try it" panel: edit the value and arguments, see the pipe's output. */
@Component({
    selector: 'app-truncate-try',
    imports: [AbInput, StatusBadge],
    template: `
        <div class="inputs">
            <div class="caption">Input</div>
            <div class="pg-field wide">
                <label for="trunc-value">value</label>
                <input
                    ab-input
                    id="trunc-value"
                    [value]="value()"
                    (input)="value.set(read($event))"
                />
            </div>
            <div class="pair">
                <div class="pg-field">
                    <label for="trunc-length">length</label>
                    <input
                        ab-input
                        id="trunc-length"
                        type="number"
                        min="0"
                        [value]="length()"
                        (input)="length.set(read($event))"
                    />
                </div>
                <div class="pg-field">
                    <label for="trunc-suffix">suffix</label>
                    <input
                        ab-input
                        id="trunc-suffix"
                        [value]="suffix()"
                        (input)="suffix.set(read($event))"
                    />
                </div>
            </div>
        </div>
        <div class="result">
            <div class="caption">Expression</div>
            <code class="expr">{{ expression() }}</code>
            <div class="caption spaced">Output</div>
            <output class="out" for="trunc-value trunc-length trunc-suffix" aria-live="polite">{{
                output() || ' '
            }}</output>
            <div class="meta">
                <app-status-badge
                    [label]="cut() ? 'Truncated' : 'Unchanged'"
                    [tone]="cut() ? 'warning' : 'success'"
                />
                {{ output().length }} of {{ value().length }} characters
            </div>
        </div>
    `,
    styleUrl: './truncate-try.scss',
})
export class TruncateTry {
    protected readonly value = signal('Abbos keeps interfaces calm, legible and easy to theme.');
    protected readonly length = signal('24');
    protected readonly suffix = signal('…');

    protected readonly output = computed(() =>
        truncate(this.value(), Number.parseInt(this.length(), 10), this.suffix()),
    );
    protected readonly cut = computed(() => this.output() !== this.value());
    protected readonly expression = computed(() => {
        const value = this.value();
        const shown = value.length > 28 ? `${value.slice(0, 28)}…` : value;
        const length = Number.parseInt(this.length(), 10) || 0;
        return `'${escape(shown)}' | truncate:${length}:'${escape(this.suffix())}'`;
    });

    protected read(event: Event): string {
        return (event.target as HTMLInputElement).value;
    }
}

function escape(text: string): string {
    return text.replace(/'/g, "\\'");
}
