import { Component } from '@angular/core';
import { AbSegmentedToggle } from 'abbos';
import { DocEntry } from '../../../core/docs/doc.model';

@Component({
    selector: 'app-segmented-toggle-thumbnail',
    imports: [AbSegmentedToggle],
    template: `<ab-segmented-toggle startLabel="Monthly" endLabel="Yearly" ariaLabel="Billing" />`,
})
class SegmentedToggleThumbnail {}

export const SEGMENTED_TOGGLE_ENTRY: DocEntry = {
    slug: 'segmented-toggle',
    category: 'components',
    kind: 'Component',
    title: 'Segmented toggle',
    description: 'Picks one of two options, like Monthly or Yearly, with a sliding thumb.',
    status: 'Beta',
    tags: ['Form'],
    selector: 'ab-segmented-toggle',
    importNames: ['AbSegmentedToggle'],
    sourcePath: 'projects/abbos/src/lib/components/form/segmented-toggle',
    thumbnail: SegmentedToggleThumbnail,
    loadPage: () => import('./segmented-toggle.page'),
};
