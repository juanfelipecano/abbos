import { Component } from '@angular/core';
import { AbChip } from 'abbos';
import { DocEntry } from '../../../core/docs/doc.model';

@Component({
    selector: 'app-chip-thumbnail',
    imports: [AbChip],
    template: `
        <ab-chip size="sm">Design</ab-chip>
        <ab-chip size="sm" variant="soft">Soft</ab-chip>
    `,
    host: { class: 'pg-row' },
})
class ChipThumbnail {}

export const CHIP_ENTRY: DocEntry = {
    slug: 'chip',
    category: 'components',
    kind: 'Component',
    title: 'Chip',
    description: 'A compact label for tags, people, filters and selections.',
    status: 'New',
    tags: ['Display'],
    selector: 'ab-chip',
    importNames: ['AbChip'],
    sourcePath: 'projects/abbos/src/lib/components/chip',
    thumbnail: ChipThumbnail,
    loadPage: () => import('./chip.page'),
};
