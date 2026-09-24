import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { ApiReference, ComponentDoc } from '../../../core/docs/doc.model';
import { findEntry } from '../../../core/docs/docs-registry';
import { PACKAGE_NAME } from '../../../core/docs/site';
import { CheckList } from '../check-list/check-list';
import { CodeBlock } from '../code-block/code-block';
import { DataTable, TableColumn } from '../data-table/data-table';
import { DocHeader } from '../doc-header/doc-header';
import { DoDont } from '../do-dont/do-dont';
import { Example } from '../example/example';
import { PrevNext } from '../prev-next/prev-next';
import { RelatedCards } from '../related-cards/related-cards';
import { SectionHeading } from '../section-heading/section-heading';

const INPUT_COLUMNS: readonly TableColumn[] = [
    { header: 'Name', kind: 'name', width: '22%' },
    { header: 'Type', kind: 'code', width: '30%' },
    { header: 'Default', kind: 'mono', width: '16%' },
    { header: 'Description', kind: 'text' },
];
const OUTPUT_COLUMNS: readonly TableColumn[] = [
    { header: 'Name', kind: 'name', width: '28%' },
    { header: 'Payload', kind: 'code', width: '24%' },
    { header: 'Description', kind: 'text' },
];
const SLOT_COLUMNS: readonly TableColumn[] = [
    { header: 'Selector', kind: 'name', width: '32%' },
    { header: 'Description', kind: 'text' },
];
const CSS_COLUMNS: readonly TableColumn[] = [
    { header: 'Property', kind: 'name', width: '32%' },
    { header: 'Default', kind: 'mono', width: '32%' },
    { header: 'Description', kind: 'text' },
];
const KEY_COLUMNS: readonly TableColumn[] = [
    { header: 'Key', kind: 'keys', width: '30%' },
    { header: 'Action', kind: 'text' },
];

/**
 * The standard component page. Content comes from a `ComponentDoc`; the playground is the
 * only part each page supplies itself, projected with the `playground` attribute.
 */
@Component({
    selector: 'app-doc-page',
    imports: [
        NgTemplateOutlet,
        DocHeader,
        SectionHeading,
        CodeBlock,
        Example,
        DataTable,
        CheckList,
        DoDont,
        RelatedCards,
        PrevNext,
    ],
    templateUrl: './doc-page.html',
    styleUrl: './doc-page.scss',
})
export class DocPage {
    public readonly doc = input.required<ComponentDoc>();

    protected readonly columns = {
        inputs: INPUT_COLUMNS,
        outputs: OUTPUT_COLUMNS,
        slots: SLOT_COLUMNS,
        css: CSS_COLUMNS,
        keys: KEY_COLUMNS,
    };

    protected readonly entry = computed(() => {
        const entry = findEntry(this.doc().slug);
        if (!entry) {
            throw new Error(`No registry entry for doc "${this.doc().slug}"`);
        }
        return entry;
    });

    protected readonly importCode = computed(
        () => `import { ${this.entry().importNames.join(', ')} } from '${PACKAGE_NAME}';`,
    );

    protected readonly multipleApis = computed(() => this.doc().api.length > 1);

    protected readonly keyboardRows = computed(() =>
        this.doc().keyboard.map((row) => [row.keys, row.action]),
    );

    protected inputRows(api: ApiReference) {
        return api.inputs.map((row) => [row.name, row.type, row.default, row.description]);
    }

    protected outputRows(api: ApiReference) {
        return (api.outputs ?? []).map((row) => [row.name, row.payload, row.description]);
    }

    protected slotRows(api: ApiReference) {
        return (api.slots ?? []).map((row) => [row.selector, row.description]);
    }

    protected cssRows(api: ApiReference) {
        return (api.cssVars ?? []).map((row) => [row.name, row.default, row.description]);
    }
}
