import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AbSwitch } from 'abbos';

@Component({
    selector: 'app-switch-demo',
    imports: [AbSwitch, ReactiveFormsModule],
    template: `
        <main
            style="display: flex; flex-direction: column; gap: 1.5rem; padding: 2rem; max-width: 640px;"
        >
            <h1>AbSwitch</h1>

            <section style="display: flex; flex-direction: column; gap: 0.75rem;">
                <h2>Size</h2>
                <div style="display: flex; align-items: center; gap: 1.5rem;">
                    @for (size of sizes; track size) {
                        <ab-switch [size]="size">{{ size }}</ab-switch>
                    }
                </div>
            </section>

            <section style="display: flex; flex-direction: column; gap: 0.75rem;">
                <h2>Shape</h2>
                <div style="display: flex; align-items: center; gap: 1.5rem;">
                    @for (shape of shapes; track shape) {
                        <ab-switch [shape]="shape">{{ shape }}</ab-switch>
                    }
                </div>
            </section>

            <section style="display: flex; flex-direction: column; gap: 0.75rem;">
                <h2>[(checked)] two-way binding</h2>
                <ab-switch [(checked)]="notificationsOn">
                    Email notifications ({{ notificationsOn() ? 'on' : 'off' }})
                </ab-switch>
            </section>

            <section style="display: flex; flex-direction: column; gap: 0.75rem;">
                <h2>Reactive Forms (ControlValueAccessor)</h2>
                <ab-switch [formControl]="marketingOptIn">Marketing emails</ab-switch>
                <p>Form value: {{ marketingOptIn.value }}</p>
            </section>

            <section style="display: flex; flex-direction: column; gap: 0.75rem;">
                <h2>Disabled</h2>
                <div style="display: flex; align-items: center; gap: 1.5rem;">
                    <ab-switch disabled>Off, disabled</ab-switch>
                    <ab-switch disabled [checked]="true">On, disabled</ab-switch>
                </div>
            </section>

            <section style="display: flex; flex-direction: column; gap: 0.75rem;">
                <h2>Icon-only (ariaLabel)</h2>
                <ab-switch ariaLabel="Toggle dark mode" [(checked)]="darkMode"></ab-switch>
            </section>
        </main>
    `,
})
export class SwitchDemo {
    protected readonly sizes = ['sm', 'md', 'lg'] as const;
    protected readonly shapes = ['square', 'round', 'circle'] as const;

    protected readonly notificationsOn = signal(false);
    protected readonly darkMode = signal(false);
    protected readonly marketingOptIn = new FormControl(false, { nonNullable: true });
}
