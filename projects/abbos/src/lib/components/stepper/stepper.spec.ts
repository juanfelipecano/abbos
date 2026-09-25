import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LucideUser } from '@lucide/angular';
import { AbStep, AbStepContent } from './step';
import { AbStepper, AbStepperMarker } from './stepper';

@Component({
    imports: [AbStepper, AbStep, AbStepContent],
    template: `
        <ab-stepper
            [(value)]="value"
            [(complete)]="complete"
            [marker]="marker()"
            [labels]="labels()"
            [interactive]="interactive()"
        >
            <ab-step value="a" title="Account" caption="Todo A" doneCaption="Done A" [icon]="user">
                <ng-template abStepContent><p class="panel-a">Panel A</p></ng-template>
            </ab-step>
            <ab-step value="b" title="Profile" caption="Todo B">
                <ng-template abStepContent><p class="panel-b">Panel B</p></ng-template>
            </ab-step>
            <ab-step value="c" title="Invite" />
        </ab-stepper>
    `,
})
class Host {
    public readonly user = LucideUser;
    public readonly value = signal<string | null>('b');
    public readonly complete = signal(false);
    public readonly marker = signal<AbStepperMarker>('icon');
    public readonly labels = signal(true);
    public readonly interactive = signal(false);
}

function setup(): ComponentFixture<Host> {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    return fixture;
}

function items(fixture: ComponentFixture<unknown>): HTMLLIElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('li'));
}

function stepperOf(fixture: ComponentFixture<Host>): AbStepper {
    return fixture.debugElement.children[0].componentInstance;
}

describe('AbStepper', () => {
    it('marks only the active step with aria-current', () => {
        const fixture = setup();
        expect(items(fixture).map((li) => li.getAttribute('aria-current'))).toEqual([
            null,
            'step',
            null,
        ]);
    });

    it('derives done, current and todo states', () => {
        const li = items(setup());
        expect(li[0].classList).toContain('ab-stepper-step_done');
        expect(li[1].classList).toContain('ab-stepper-step_current');
        expect(li[2].classList).toContain('ab-stepper-step_todo');
        expect(li[2].classList).toContain('ab-stepper-step_last');
        expect(li[2].querySelector('.ab-stepper-line')).toBeNull();
    });

    it('shows the done caption once a step is done', () => {
        const li = items(setup());
        expect(li[0].querySelector('.ab-stepper-caption')?.textContent).toBe('Done A');
        expect(li[1].querySelector('.ab-stepper-caption')?.textContent).toBe('Todo B');
    });

    it('renders icons, numbers and checks by marker', () => {
        const fixture = setup();
        expect(items(fixture)[0].querySelector('svg')).not.toBeNull();
        expect(items(fixture)[1].querySelector('svg')).toBeNull(); // no icon set → number
        expect(items(fixture)[1].querySelector('.ab-stepper-marker')?.textContent?.trim()).toBe(
            '2',
        );

        fixture.componentInstance.marker.set('number');
        fixture.detectChanges();
        expect(items(fixture)[0].querySelector('svg')).not.toBeNull(); // check
        expect(items(fixture)[2].querySelector('.ab-stepper-marker')?.textContent?.trim()).toBe(
            '3',
        );
    });

    it('always shows labels for the text marker, and hides them when labels is off', () => {
        const fixture = setup();
        fixture.componentInstance.labels.set(false);
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('.ab-stepper-title')).toBeNull();
        expect(items(fixture)[1].querySelector('.ab-stepper-sr')?.textContent).toContain('Profile');

        fixture.componentInstance.marker.set('text');
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelectorAll('.ab-stepper-title').length).toBe(3);
    });

    it('renders only the active step content', () => {
        const fixture = setup();
        expect(fixture.nativeElement.querySelector('.panel-b')).not.toBeNull();
        expect(fixture.nativeElement.querySelector('.panel-a')).toBeNull();
        fixture.componentInstance.value.set('a');
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('.panel-a')).not.toBeNull();
        expect(fixture.nativeElement.querySelector('.panel-b')).toBeNull();
    });

    it('next() and back() move through steps and clamp at the start', () => {
        const fixture = setup();
        const stepper = stepperOf(fixture);
        stepper.next();
        expect(fixture.componentInstance.value()).toBe('c');
        stepper.back();
        stepper.back();
        stepper.back();
        expect(fixture.componentInstance.value()).toBe('a');
        expect(stepper.isFirst()).toBe(true);
    });

    it('completes from the last step and reopens it with back()', () => {
        const fixture = setup();
        const stepper = stepperOf(fixture);
        stepper.next();
        stepper.next();
        fixture.detectChanges();
        expect(fixture.componentInstance.complete()).toBe(true);
        expect(items(fixture).every((li) => li.getAttribute('aria-current') === null)).toBe(true);
        expect(items(fixture).every((li) => li.classList.contains('ab-stepper-step_done'))).toBe(
            true,
        );
        stepper.back();
        expect(fixture.componentInstance.complete()).toBe(false);
        expect(fixture.componentInstance.value()).toBe('c');
    });

    it('announces the current step politely', () => {
        const fixture = setup();
        expect(fixture.nativeElement.querySelector('[aria-live]').textContent).toBe(
            'Step 2 of 3: Profile',
        );
    });

    it('is read-only by default', () => {
        expect(setup().nativeElement.querySelector('button')).toBeNull();
    });

    it('lets interactive steppers jump back to completed steps only', () => {
        const fixture = setup();
        fixture.componentInstance.interactive.set(true);
        fixture.detectChanges();
        const buttons = fixture.nativeElement.querySelectorAll('button');
        expect(buttons.length).toBe(1);
        buttons[0].click();
        fixture.detectChanges();
        expect(fixture.componentInstance.value()).toBe('a');
    });
});
