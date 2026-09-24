import { Component, input, model } from '@angular/core';
import { nextTabIndex } from './tab-keys';

export interface SegOption<T extends string = string> {
    readonly value: T;
    readonly label: string;
}

let nextId = 0;

/**
 * Small segmented tab bar (Preview/Code, npm/pnpm/yarn). Owns selection and keyboard handling;
 * the caller renders the panel and points it back with `aria-labelledby`/`panelId`.
 */
@Component({
    selector: 'app-seg-tabs',
    template: `
        <div class="seg" role="tablist" [attr.aria-label]="label()" (keydown)="onKeydown($event)">
            @for (option of options(); track option.value; let i = $index) {
                <button
                    type="button"
                    role="tab"
                    class="seg-tab"
                    [id]="tabId(option.value)"
                    [attr.aria-selected]="option.value === value()"
                    [attr.aria-controls]="panelId() ?? null"
                    [attr.tabindex]="option.value === value() ? 0 : -1"
                    (click)="value.set(option.value)"
                >
                    {{ option.label }}
                </button>
            }
        </div>
    `,
    styleUrl: './seg-tabs.scss',
})
export class SegTabs {
    public readonly options = input.required<readonly SegOption[]>();
    public readonly value = model.required<string>();
    public readonly label = input.required<string>();
    public readonly panelId = input<string>();

    private readonly uid = `seg-${nextId++}`;

    public tabId(value: string): string {
        return `${this.uid}-${value}`;
    }

    protected onKeydown(event: KeyboardEvent): void {
        const options = this.options();
        const current = options.findIndex((option) => option.value === this.value());
        const index = nextTabIndex(event, current, options.length);
        if (index !== null) {
            this.value.set(options[index].value);
        }
    }
}
