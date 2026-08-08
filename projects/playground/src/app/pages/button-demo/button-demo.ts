import { Component, signal } from '@angular/core';
import { AbButton, AbButtonVariant } from 'abbos';

@Component({
    selector: 'app-button-demo',
    imports: [AbButton],
    template: `
        <main
            style="display: flex; flex-direction: column; gap: 1.5rem; padding: 2rem; max-width: 640px;"
        >
            <h1>AbButton</h1>

            <section style="display: flex; flex-direction: column; gap: 0.75rem;">
                <h2>Variant</h2>
                <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                    @for (variant of variants; track variant) {
                        <button ab-button [variant]="variant">{{ variant }}</button>
                    }
                </div>
            </section>

            <section style="display: flex; flex-direction: column; gap: 0.75rem;">
                <h2>Size</h2>
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <button ab-button size="sm">Small</button>
                    <button ab-button size="md">Medium</button>
                    <button ab-button size="lg">Large</button>
                </div>
            </section>

            <section style="display: flex; flex-direction: column; gap: 0.75rem;">
                <h2>Shape</h2>
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <button ab-button shape="square">Square</button>
                    <button ab-button shape="round">Round</button>
                    <button ab-button shape="circle">Circle</button>
                </div>
            </section>

            <section style="display: flex; flex-direction: column; gap: 0.75rem;">
                <h2>Icons (abStart / abEnd)</h2>
                <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                    <button ab-button variant="secondary">
                        <svg abStart width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                            <path d="M8 1v14M1 8h14" stroke="currentColor" stroke-width="2" />
                        </svg>
                        Add item
                    </button>
                    <button ab-button variant="outline">
                        Export
                        <svg abEnd width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                            <path
                                d="M2 8h12M9 3l5 5-5 5"
                                stroke="currentColor"
                                stroke-width="2"
                                fill="none"
                            />
                        </svg>
                    </button>
                </div>
            </section>

            <section style="display: flex; flex-direction: column; gap: 0.75rem;">
                <h2>Loading / disabled</h2>
                <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                    <button ab-button [loading]="saving()" (click)="toggleSaving()">
                        {{ saving() ? 'Saving' : 'Save' }}
                    </button>
                    <button ab-button disabled>Disabled</button>
                    <button
                        ab-button
                        variant="danger"
                        [loading]="deleting()"
                        (click)="toggleDeleting()"
                    >
                        Delete
                    </button>
                </div>
            </section>
        </main>
    `,
})
export class ButtonDemo {
    protected readonly variants: AbButtonVariant[] = [
        'primary',
        'secondary',
        'soft',
        'outline',
        'ghost',
        'danger',
    ];

    protected readonly saving = signal(false);
    protected readonly deleting = signal(false);

    // Once `loading` is true the button is also `disabled` (AC-F7/AC-F8), so a real click
    // can never toggle it back off — simulate an async operation completing instead of
    // relying on a second click the button can no longer receive.
    protected toggleSaving(): void {
        this.saving.set(true);
        setTimeout(() => this.saving.set(false), 1500);
    }

    protected toggleDeleting(): void {
        this.deleting.set(true);
        setTimeout(() => this.deleting.set(false), 1500);
    }
}
