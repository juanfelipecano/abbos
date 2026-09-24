import {
    booleanAttribute,
    Component,
    contentChild,
    Directive,
    inject,
    input,
    TemplateRef,
    viewChild,
} from '@angular/core';

/** Marks an `<ng-template>` inside `<ab-segment>` as the content shown while that segment is active. */
@Directive({ selector: 'ng-template[abSegmentContent]' })
export class AbSegmentContent {
    public readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}

/**
 * One option of `<ab-segments>`. Its projected content is the label. It renders nothing by
 * itself; the parent picks up the label and the optional `abSegmentContent` template.
 */
@Component({
    selector: 'ab-segment',
    template: `<ng-template #label><ng-content /></ng-template>`,
    host: { class: 'ab-segment' },
})
export class AbSegment {
    public readonly value = input.required<string>();
    public readonly disabled = input(false, { transform: booleanAttribute });

    public readonly label = viewChild.required<TemplateRef<unknown>>('label');
    public readonly content = contentChild(AbSegmentContent);
}
