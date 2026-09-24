import { Component, input } from '@angular/core';
import { LucideChevronDown } from '@lucide/angular';
import { AbInput, AbSwitch } from 'abbos';
import { CodeBlock } from '../code-block/code-block';
import { PreviewCanvas } from '../preview-canvas/preview-canvas';
import { PlaygroundModel } from './playground-state';

let nextId = 0;

/**
 * Live preview + controls + generated code. The controls are built from the model's schema
 * and use Abbos' own Switch and Input, so the playground doubles as a dogfooding surface.
 */
@Component({
    selector: 'app-playground-frame',
    imports: [PreviewCanvas, CodeBlock, AbSwitch, AbInput, LucideChevronDown],
    templateUrl: './playground-frame.html',
    styleUrl: './playground-frame.scss',
})
export class PlaygroundFrame {
    public readonly model = input.required<PlaygroundModel>();
    public readonly code = input.required<string>();
    public readonly fileName = input('playground.html');

    protected readonly uid = `pg-${nextId++}`;

    protected text(value: unknown): string {
        return typeof value === 'string' ? value : '';
    }

    protected onInput(key: string, event: Event): void {
        this.model().write(key, (event.target as HTMLInputElement | HTMLSelectElement).value);
    }
}
