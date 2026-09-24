import { Component, input } from '@angular/core';
import { LucideInfo, LucideLightbulb, LucideTriangleAlert } from '@lucide/angular';

export type CalloutTone = 'tip' | 'info' | 'warning';

/** Highlighted note. The body is projected, so it can hold inline code or links. */
@Component({
    selector: 'app-callout',
    imports: [LucideInfo, LucideLightbulb, LucideTriangleAlert],
    template: `
        <span class="icon">
            @switch (tone()) {
                @case ('tip') {
                    <svg lucideLightbulb [size]="16" aria-hidden="true"></svg>
                }
                @case ('info') {
                    <svg lucideInfo [size]="16" aria-hidden="true"></svg>
                }
                @case ('warning') {
                    <svg lucideTriangleAlert [size]="16" aria-hidden="true"></svg>
                }
            }
        </span>
        <div class="content">
            @if (heading(); as text) {
                <strong class="title">{{ text }}</strong>
            }
            <div class="text"><ng-content /></div>
        </div>
    `,
    styleUrl: './callout.scss',
    host: { role: 'note', '[attr.data-tone]': 'tone()' },
})
export class Callout {
    public readonly tone = input<CalloutTone>('info');
    public readonly heading = input<string>();
}
