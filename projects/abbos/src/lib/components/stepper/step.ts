import { Component, contentChild, Directive, inject, input, TemplateRef } from '@angular/core';
import { LucideIconInput } from '@lucide/angular';

/** Marks an `<ng-template>` inside `<ab-step>` as the content shown while that step is active. */
@Directive({ selector: 'ng-template[abStepContent]' })
export class AbStepContent {
    public readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}

/**
 * One step of `<ab-stepper>`. It renders nothing by itself; the parent reads its inputs to draw
 * the marker and labels, and picks up the optional `abStepContent` template.
 */
@Component({
    selector: 'ab-step',
    template: '',
    host: { class: 'ab-step' },
})
export class AbStep {
    public readonly value = input.required<string>();
    public readonly title = input<string>();
    /** Secondary line under the title. */
    public readonly caption = input<string>();
    /** Replaces `caption` once the step is done, e.g. "Email confirmed". */
    public readonly doneCaption = input<string>();
    /** Marker icon when the stepper's `marker` is `icon`. Falls back to the step number. */
    public readonly icon = input<LucideIconInput>();

    public readonly content = contentChild(AbStepContent);
}
