import { Component, input } from '@angular/core';
import { LucideCheck } from '@lucide/angular';

@Component({
    selector: 'app-check-list',
    imports: [LucideCheck],
    template: `
        <ul>
            @for (item of items(); track item) {
                <li>
                    <svg lucideCheck [size]="16" aria-hidden="true"></svg>
                    <span>{{ item }}</span>
                </li>
            }
        </ul>
    `,
    styles: `
        ul {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin: var(--ab-space-2) 0 0;
            padding: 0;
            list-style: none;
        }

        li {
            display: flex;
            gap: 10px;
            color: var(--ab-text-secondary);
            font: var(--ab-fs-14) / 1.55 var(--ab-font-sans);
            text-wrap: pretty;
        }

        svg {
            flex: none;
            margin-top: 3px;
            color: var(--ab-primary);
        }
    `,
})
export class CheckList {
    public readonly items = input.required<readonly string[]>();
}
