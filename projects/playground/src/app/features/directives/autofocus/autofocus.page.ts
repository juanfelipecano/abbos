import { Component } from '@angular/core';
import { TableColumn } from '../../../shared/ui/data-table/data-table';
import { PACKAGE_NAME } from '../../../core/docs/site';
import { exampleFiles } from '../../../shared/docs/example-files';
import { Callout } from '../../../shared/ui/callout/callout';
import { CodeBlock } from '../../../shared/ui/code-block/code-block';
import { DataTable } from '../../../shared/ui/data-table/data-table';
import { DocHeader } from '../../../shared/ui/doc-header/doc-header';
import { PrevNext } from '../../../shared/ui/prev-next/prev-next';
import { RelatedCards } from '../../../shared/ui/related-cards/related-cards';
import { SectionHeading } from '../../../shared/ui/section-heading/section-heading';
import { AUTOFOCUS_ENTRY } from './autofocus.entry';
import { AutofocusDemo } from './autofocus-demo';

const DEMO_HTML = `<label for="name">Workspace name</label>
<input
  id="name"
  placeholder="e.g. Abbos Studio"
  abAutofocus
  [autofocusDelay]="150"
/>`;

const INPUT_COLUMNS: readonly TableColumn[] = [
    { header: 'Name', kind: 'name', width: '24%' },
    { header: 'Type', kind: 'code', width: '22%' },
    { header: 'Default', kind: 'mono', width: '14%' },
    { header: 'Description', kind: 'text' },
];

@Component({
    selector: 'app-autofocus-page',
    imports: [
        DocHeader,
        SectionHeading,
        CodeBlock,
        DataTable,
        Callout,
        RelatedCards,
        PrevNext,
        AutofocusDemo,
    ],
    templateUrl: './autofocus.page.html',
    styleUrl: './autofocus.page.scss',
})
export default class AutofocusPage {
    protected readonly entry = AUTOFOCUS_ENTRY;
    protected readonly hosts = ['input', 'textarea', 'select', 'button', '[tabindex]'];
    protected readonly importCode = `import { AbAutofocus } from '${PACKAGE_NAME}';`;
    protected readonly files = exampleFiles({
        name: 'create-workspace',
        html: DEMO_HTML,
        imports: ['AbAutofocus'],
        layout: 'stack',
    });
    protected readonly inputColumns = INPUT_COLUMNS;
    protected readonly inputs = [
        [
            'abAutofocus',
            "boolean | ''",
            'true',
            'Set to false to skip focusing, e.g. on touch devices.',
        ],
        ['autofocusDelay', 'number', '0', 'Milliseconds to wait — useful inside animated dialogs.'],
        ['autofocusSelect', 'boolean', 'false', 'Selects existing text after focusing.'],
    ];
}
