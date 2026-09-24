import { Component } from '@angular/core';
import { AbInput } from 'abbos';
import { DocEntry } from '../../../core/docs/doc.model';

@Component({
    selector: 'app-input-thumbnail',
    imports: [AbInput],
    template: `<input ab-input size="sm" placeholder="you@company.com" tabindex="-1" />`,
    styles: `
        :host {
            display: block;
            width: 200px;
        }
    `,
})
class InputThumbnail {}

export const INPUT_ENTRY: DocEntry = {
    slug: 'input',
    category: 'components',
    kind: 'Component',
    title: 'Input',
    description: 'A single-line text field styled for Abbos, on top of the native <input>.',
    status: 'New',
    tags: ['Form'],
    selector: 'input[ab-input]',
    importNames: ['AbInput'],
    sourcePath: 'projects/abbos/src/lib/components/form/input',
    thumbnail: InputThumbnail,
    loadPage: () => import('./input.page'),
};
