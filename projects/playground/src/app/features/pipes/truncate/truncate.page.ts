import { Component } from '@angular/core';
import { PACKAGE_NAME } from '../../../core/docs/site';
import { Callout } from '../../../shared/ui/callout/callout';
import { CodeBlock } from '../../../shared/ui/code-block/code-block';
import { DataTable, TableColumn } from '../../../shared/ui/data-table/data-table';
import { DocHeader } from '../../../shared/ui/doc-header/doc-header';
import { PrevNext } from '../../../shared/ui/prev-next/prev-next';
import { RelatedCards } from '../../../shared/ui/related-cards/related-cards';
import { SectionHeading } from '../../../shared/ui/section-heading/section-heading';
import { TRUNCATE_ENTRY } from './truncate.entry';
import { TruncateTry } from './truncate-try';

const PARAM_COLUMNS: readonly TableColumn[] = [
    { header: 'Name', kind: 'name', width: '18%' },
    { header: 'Type', kind: 'code', width: '22%' },
    { header: 'Default', kind: 'mono', width: '14%' },
    { header: 'Description', kind: 'text' },
];

const TEMPLATE_USAGE = `<p class="excerpt">{{ post.summary | truncate: 120 }}</p>

<span [title]="file.name">
  {{ file.name | truncate: 24 : '…' }}
</span>`;

const TS_USAGE = `import { Component } from '@angular/core';
import { truncate } from '${PACKAGE_NAME}';

@Component({
  selector: 'app-file-list',
  templateUrl: './file-list.html',
})
export class FileList {
  label(name: string) {
    return truncate(name, 24, '…');
  }
}`;

@Component({
    selector: 'app-truncate-page',
    imports: [
        DocHeader,
        SectionHeading,
        CodeBlock,
        DataTable,
        Callout,
        RelatedCards,
        PrevNext,
        TruncateTry,
    ],
    templateUrl: './truncate.page.html',
    styleUrl: './truncate.page.scss',
})
export default class TruncatePage {
    protected readonly entry = TRUNCATE_ENTRY;
    protected readonly importCode = `import { AbTruncatePipe } from '${PACKAGE_NAME}';`;
    protected readonly templateUsage = TEMPLATE_USAGE;
    protected readonly tsUsage = TS_USAGE;
    protected readonly paramColumns = PARAM_COLUMNS;
    protected readonly params = [
        ['value', 'string | null', '—', "The text to transform. null and undefined return ''."],
        ['length', 'number', '20', 'Maximum characters kept before the suffix.'],
        ['suffix', 'string', "'…'", 'Appended only when the value is cut.'],
    ];
}
