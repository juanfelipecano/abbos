import { NgComponentOutlet } from '@angular/common';
import { Component, computed, input, linkedSignal } from '@angular/core';
import { ExampleDef } from '../../../core/docs/doc.model';
import { TocEntry } from '../../../core/toc/toc-entry';
import { CodeBlock } from '../code-block/code-block';
import { PreviewCanvas } from '../preview-canvas/preview-canvas';
import { SegOption, SegTabs } from '../tabs/seg-tabs';

const VIEWS: readonly SegOption[] = [
    { value: 'preview', label: 'Preview' },
    { value: 'code', label: 'Code' },
];

/** One example: live component on the Preview tab, its real source on the Code tab. */
@Component({
    selector: 'app-example',
    imports: [NgComponentOutlet, TocEntry, SegTabs, PreviewCanvas, CodeBlock],
    template: `
        <div class="head">
            <div class="intro">
                <h3 [appTocEntry]="'ex-' + example().id" [tocLevel]="3">{{ example().title }}</h3>
                <p>{{ example().description }}</p>
            </div>
            <app-seg-tabs
                #tabs
                label="View"
                [options]="views"
                [(value)]="view"
                [panelId]="panelId()"
            />
        </div>
        <div role="tabpanel" [id]="panelId()" [attr.aria-labelledby]="tabs.tabId(view())">
            @if (view() === 'preview') {
                <app-preview-canvas class="preview" [dotted]="false" surface>
                    <ng-container *ngComponentOutlet="example().component" />
                </app-preview-canvas>
            } @else {
                <app-code-block [files]="example().files" />
            }
        </div>
    `,
    styleUrl: './example.scss',
})
export class Example {
    public readonly example = input.required<ExampleDef>();

    protected readonly views = VIEWS;
    protected readonly view = linkedSignal(() => (this.example().showCode ? 'code' : 'preview'));
    protected readonly panelId = computed(() => `ex-${this.example().id}-panel`);
}
