import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AbSegmentedToggle } from 'abbos';

@Component({
    selector: 'app-segmented-toggle-demo',
    imports: [AbSegmentedToggle, ReactiveFormsModule],
    template: `
        <main
            style="display: flex; flex-direction: column; gap: 1.5rem; padding: 2rem; max-width: 640px;"
        >
            <h1>AbSegmentedToggle</h1>

            <section style="display: flex; flex-direction: column; gap: 0.75rem;">
                <h2>Size</h2>
                @for (size of sizes; track size) {
                    <div>
                        <ab-segmented-toggle startLabel="0" endLabel="2" [size]="size" />
                    </div>
                }
            </section>

            <section style="display: flex; flex-direction: column; gap: 0.75rem;">
                <h2>Shape</h2>
                @for (shape of shapes; track shape) {
                    <div>
                        <ab-segmented-toggle startLabel="0" endLabel="2" [shape]="shape" />
                    </div>
                }
            </section>

            <section style="display: flex; flex-direction: column; gap: 0.75rem;">
                <h2>[(checked)] two-way binding</h2>
                <div>
                    <ab-segmented-toggle
                        startLabel="Off"
                        endLabel="On"
                        ariaLabel="Power"
                        [(checked)]="power"
                    />
                </div>
                <p>Checked: {{ power() }}</p>
            </section>

            <section style="display: flex; flex-direction: column; gap: 0.75rem;">
                <h2>Reactive Forms (ControlValueAccessor)</h2>
                <div>
                    <ab-segmented-toggle startLabel="0" endLabel="2" [formControl]="control" />
                </div>
                <p>Form value: {{ control.value }}</p>
            </section>

            <section style="display: flex; flex-direction: column; gap: 0.75rem;">
                <h2>Disabled</h2>
                <div><ab-segmented-toggle startLabel="0" endLabel="2" disabled /></div>
            </section>
        </main>
    `,
})
export class SegmentedToggleDemo {
    protected readonly sizes = ['sm', 'md', 'lg'] as const;
    protected readonly shapes = ['square', 'round', 'circle'] as const;
    protected readonly power = signal(false);
    protected readonly control = new FormControl(false, { nonNullable: true });
}
