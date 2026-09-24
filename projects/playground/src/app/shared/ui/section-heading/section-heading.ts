import { Component, input } from '@angular/core';
import { TocEntry } from '../../../core/toc/toc-entry';

/** h2/h3 with an optional lead paragraph; registers itself in "On this page". */
@Component({
    selector: 'app-section-heading',
    imports: [TocEntry],
    template: `
        @if (level() === 2) {
            <h2 [appTocEntry]="anchor()" [tocLevel]="2">{{ heading() }}</h2>
        } @else {
            <h3 [appTocEntry]="anchor()" [tocLevel]="3">{{ heading() }}</h3>
        }
        @if (lead(); as text) {
            <p class="lead">{{ text }}</p>
        }
    `,
    styleUrl: './section-heading.scss',
    host: { '[class.sub]': 'level() === 3' },
})
export class SectionHeading {
    public readonly anchor = input.required<string>();
    public readonly heading = input.required<string>();
    public readonly lead = input<string>();
    public readonly level = input<2 | 3>(2);
}
