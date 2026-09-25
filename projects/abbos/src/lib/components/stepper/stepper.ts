import { NgTemplateOutlet } from '@angular/common';
import {
    booleanAttribute,
    Component,
    computed,
    contentChildren,
    input,
    model,
} from '@angular/core';
import { LucideCheck, LucideDynamicIcon } from '@lucide/angular';
import { AbStep } from './step';

export type AbStepperMarker = 'icon' | 'number' | 'text';
export type AbStepState = 'done' | 'current' | 'todo';

let nextId = 0;

/**
 * Shows where you are in a multi-step flow. Markers can be icons, numbers or small dots with
 * text labels; the connector fills as steps complete. Like `<ab-segments>`, each `<ab-step>` can
 * declare the content shown while it is active with `abStepContent`. Navigation stays with the
 * caller: bind `[(value)]` and drive it with `next()` / `back()` or your own buttons.
 */
@Component({
    selector: 'ab-stepper',
    imports: [NgTemplateOutlet, LucideDynamicIcon],
    templateUrl: './stepper.html',
    styleUrl: './stepper.scss',
    host: {
        class: 'ab-stepper',
        '[class.ab-stepper_icon]': `marker() === 'icon'`,
        '[class.ab-stepper_number]': `marker() === 'number'`,
        '[class.ab-stepper_text]': `marker() === 'text'`,
    },
})
export class AbStepper {
    protected readonly uid = `ab-stepper-${nextId++}`;
    protected readonly checkIcon = LucideCheck;

    /** The `value` of the active step, or `null` for none. */
    public readonly value = model<string | null>(null);
    /** Marks every step as done and none as current, e.g. for an "all set" screen. */
    public readonly complete = model(false);
    public readonly marker = input<AbStepperMarker>('icon');
    /** Shows title and caption under each marker. The `text` marker always shows them. */
    public readonly labels = input(true, { transform: booleanAttribute });
    /** Makes completed steps buttons that jump back to that step. */
    public readonly interactive = input(false, { transform: booleanAttribute });
    public readonly ariaLabel = input<string>('Progress');

    protected readonly steps = contentChildren(AbStep);

    protected readonly showLabels = computed(() => this.labels() || this.marker() === 'text');
    public readonly activeIndex = computed(() => {
        const value = this.value();
        return this.steps().findIndex((step) => step.value() === value);
    });
    public readonly isFirst = computed(() => !this.complete() && this.activeIndex() <= 0);
    public readonly isLast = computed(
        () => !this.complete() && this.activeIndex() === this.steps().length - 1,
    );
    protected readonly activeStep = computed(() =>
        this.complete() ? undefined : this.steps()[this.activeIndex()],
    );
    protected readonly activeContent = computed(
        () => this.activeStep()?.content()?.template ?? null,
    );
    protected readonly announcement = computed(() => {
        if (this.complete()) {
            return 'Complete';
        }
        const index = this.activeIndex();
        if (index < 0) {
            return '';
        }
        const title = this.steps()[index].title();
        return `Step ${index + 1} of ${this.steps().length}${title ? `: ${title}` : ''}`;
    });

    /** Moves to the next step, or completes the flow from the last one. */
    public next(): void {
        if (this.complete()) {
            return;
        }
        const steps = this.steps();
        const index = this.activeIndex();
        if (index >= steps.length - 1) {
            this.complete.set(true);
            return;
        }
        this.value.set(steps[index + 1].value());
    }

    /** Moves to the previous step, or reopens the last one from the complete state. */
    public back(): void {
        const steps = this.steps();
        if (this.complete()) {
            this.complete.set(false);
            return;
        }
        const index = this.activeIndex();
        if (index > 0) {
            this.value.set(steps[index - 1].value());
        }
    }

    protected stateOf(index: number): AbStepState {
        if (this.complete()) {
            return 'done';
        }
        const active = this.activeIndex();
        return index < active ? 'done' : index === active ? 'current' : 'todo';
    }

    protected captionOf(step: AbStep, state: AbStepState): string | undefined {
        return (state === 'done' && step.doneCaption()) || step.caption();
    }

    protected statusOf(state: AbStepState): string {
        return { done: 'completed', current: 'current step', todo: 'not started' }[state];
    }

    protected select(index: number): void {
        if (this.stateOf(index) !== 'done') {
            return;
        }
        this.complete.set(false);
        this.value.set(this.steps()[index].value());
    }
}
