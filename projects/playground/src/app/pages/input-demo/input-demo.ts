import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AbInput } from 'abbos';

@Component({
    selector: 'app-input-demo',
    imports: [AbInput, ReactiveFormsModule],
    template: `
        <main style="display: flex; flex-direction: column; gap: 1.5rem; padding: 2rem; max-width: 480px;">
            <h1>AbInput</h1>

            <section style="display: flex; flex-direction: column; gap: 0.75rem;">
                <h2>Size</h2>
                <input ab-input type="text" size="sm" aria-label="Small input" placeholder="sm" />
                <input ab-input type="text" size="md" aria-label="Medium input" placeholder="md" />
                <input ab-input type="text" size="lg" aria-label="Large input" placeholder="lg" />
            </section>

            <section style="display: flex; flex-direction: column; gap: 0.75rem;">
                <h2>Shape</h2>
                <input
                    ab-input
                    type="text"
                    shape="square"
                    aria-label="Square shaped input"
                    placeholder="square"
                />
                <input
                    ab-input
                    type="text"
                    shape="round"
                    aria-label="Round shaped input"
                    placeholder="round"
                />
                <input
                    ab-input
                    type="text"
                    shape="circle"
                    aria-label="Circle shaped input"
                    placeholder="circle"
                />
            </section>

            <section style="display: flex; flex-direction: column; gap: 0.75rem;">
                <h2>States</h2>
                <input ab-input type="text" aria-label="Default state input" placeholder="default" />
                <input
                    ab-input
                    type="text"
                    aria-label="Disabled input"
                    placeholder="disabled"
                    disabled
                />
                <input
                    ab-input
                    type="text"
                    aria-label="Read-only input"
                    placeholder="read-only"
                    value="read-only value"
                    readonly
                />
                <input
                    ab-input
                    type="text"
                    [formControl]="invalidControl"
                    aria-label="Invalid input"
                    placeholder="type then blur to see the invalid state"
                />
            </section>
        </main>
    `,
})
export class InputDemo {
    protected readonly invalidControl = new FormControl('', {
        nonNullable: true,
        validators: Validators.required,
    });

    constructor() {
        this.invalidControl.markAsTouched();
    }
}
