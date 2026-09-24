import { Component } from '@angular/core';
import { AbSegment, AbSegments } from 'abbos';
import { DocEntry } from '../../../core/docs/doc.model';

@Component({
    selector: 'app-segments-thumbnail',
    imports: [AbSegments, AbSegment],
    template: `
        <ab-segments size="sm" value="expense" ariaLabel="Preview">
            <ab-segment value="expense">Expense</ab-segment>
            <ab-segment value="income">Income</ab-segment>
        </ab-segments>
    `,
    host: { class: 'pg-row' },
})
class SegmentsThumbnail {}

export const SEGMENTS_ENTRY: DocEntry = {
    slug: 'segments',
    category: 'components',
    kind: 'Component',
    title: 'Segments',
    description: 'Switches between two or more options, and optionally the content behind them.',
    status: 'New',
    tags: ['Form'],
    selector: 'ab-segments',
    importNames: ['AbSegments', 'AbSegment', 'AbSegmentContent'],
    sourcePath: 'projects/abbos/src/lib/components/segments',
    thumbnail: SegmentsThumbnail,
    loadPage: () => import('./segments.page'),
};
