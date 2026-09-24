import { Component } from '@angular/core';

/**
 * Round ghost button for icon-only chrome actions (menu, search, theme). The library has no
 * IconButton yet, so this lives in the playground. Callers must set `aria-label`.
 */
@Component({
    selector: 'button[app-icon-button], a[app-icon-button]',
    template: '<ng-content />',
    styles: `
        :host {
            display: inline-flex;
            flex: none;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            padding: 0;
            border: 0;
            border-radius: var(--ab-radius-full);
            background: transparent;
            color: var(--ab-text-secondary);
            cursor: pointer;
            transition:
                background var(--ab-dur-fast) var(--ab-ease-standard),
                transform var(--ab-dur-fast) var(--ab-ease-standard);
        }

        :host(:hover) {
            background: var(--ab-surface-hover);
            color: var(--ab-text);
        }

        :host(:active) {
            transform: scale(0.94);
        }
    `,
})
export class IconButton {}
