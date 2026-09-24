import { NgComponentOutlet } from '@angular/common';
import { Component, input } from '@angular/core';
import { LucideCheck, LucideX } from '@lucide/angular';
import { BestPractice } from '../../../core/docs/doc.model';

@Component({
    selector: 'app-do-dont',
    imports: [NgComponentOutlet, LucideCheck, LucideX],
    template: `
        @for (item of items(); track item.text) {
            <figure class="card" [class.bad]="!item.ok">
                <div class="preview">
                    <ng-container *ngComponentOutlet="item.component" />
                </div>
                <figcaption>
                    <span class="mark" aria-hidden="true">
                        @if (item.ok) {
                            <svg lucideCheck [size]="12" [strokeWidth]="3"></svg>
                        } @else {
                            <svg lucideX [size]="12" [strokeWidth]="3"></svg>
                        }
                    </span>
                    <span>
                        <strong>{{ item.ok ? 'Do' : 'Don’t' }}</strong>
                        <span class="text">{{ item.text }}</span>
                    </span>
                </figcaption>
            </figure>
        }
    `,
    styleUrl: './do-dont.scss',
})
export class DoDont {
    public readonly items = input.required<readonly BestPractice[]>();
}
