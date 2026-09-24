import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Abbos "A" mark + wordmark, linking home. */
@Component({
    selector: 'app-logo',
    imports: [RouterLink],
    template: `
        <a class="logo" routerLink="/" aria-label="Abbos home">
            <svg width="24" height="24" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                <path
                    d="M10 39 L24 9 L38 39"
                    stroke="currentColor"
                    stroke-width="5.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
                <circle cx="24" cy="27" r="3.2" fill="currentColor" />
            </svg>
            <span class="word">Abbos</span>
            <ng-content />
        </a>
    `,
    styles: `
        .logo {
            display: flex;
            flex: none;
            align-items: center;
            gap: 10px;
            color: var(--ab-text);

            &:hover {
                color: var(--ab-text);
                text-decoration: none;
            }
        }

        svg {
            color: var(--ab-primary);
        }

        .word {
            font: var(--ab-fw-extra) 18px / 1 var(--ab-font-sans);
            letter-spacing: var(--ab-ls-tight);
        }
    `,
})
export class Logo {}
