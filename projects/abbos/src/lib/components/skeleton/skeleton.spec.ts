import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbSkeleton, AbSkeletonAnimation, AbSkeletonVariant } from './skeleton';

@Component({
    imports: [AbSkeleton],
    template: `
        <ab-skeleton
            [variant]="variant()"
            [animation]="animation()"
            [lines]="lines()"
            [width]="width()"
            [height]="height()"
        />
    `,
})
class TestHost {
    public readonly variant = signal<AbSkeletonVariant>('rect');
    public readonly animation = signal<AbSkeletonAnimation>('pulse');
    public readonly lines = signal<number | string>(1);
    public readonly width = signal<string | undefined>(undefined);
    public readonly height = signal<string | undefined>(undefined);
}

describe('AbSkeleton', () => {
    let fixture: ComponentFixture<TestHost>;
    let host: TestHost;
    let el: HTMLElement;

    const bars = () => el.querySelectorAll('.ab-skeleton-bar');

    beforeEach(async () => {
        await TestBed.configureTestingModule({ imports: [TestHost] }).compileComponents();
        fixture = TestBed.createComponent(TestHost);
        host = fixture.componentInstance;
        await fixture.whenStable();
        el = fixture.nativeElement.querySelector('ab-skeleton');
    });

    it('is hidden from assistive technology', () => {
        expect(el.getAttribute('aria-hidden')).toBe('true');
    });

    it('defaults to a pulsing rectangle', () => {
        expect(el.classList).toContain('ab-skeleton_rect');
        expect(el.classList).toContain('ab-skeleton_pulse');
        expect(bars().length).toBe(1);
    });

    it('reflects variant and animation as classes', async () => {
        host.variant.set('circle');
        host.animation.set('shimmer');
        await fixture.whenStable();
        expect(el.classList).toContain('ab-skeleton_circle');
        expect(el.classList).not.toContain('ab-skeleton_rect');
        expect(el.classList).toContain('ab-skeleton_shimmer');
        expect(el.classList).not.toContain('ab-skeleton_pulse');

        host.animation.set('none');
        await fixture.whenStable();
        expect(el.classList).not.toContain('ab-skeleton_shimmer');
        expect(el.classList).not.toContain('ab-skeleton_pulse');
    });

    it('renders one bar per line for the text variant only', async () => {
        host.lines.set('3');
        await fixture.whenStable();
        expect(bars().length).toBe(1);

        host.variant.set('text');
        await fixture.whenStable();
        expect(bars().length).toBe(3);

        host.lines.set(0);
        await fixture.whenStable();
        expect(bars().length).toBe(1);
    });

    it('passes width and height through as custom properties', async () => {
        host.width.set('60%');
        host.height.set('120px');
        await fixture.whenStable();
        expect(el.style.getPropertyValue('--skeleton-w')).toBe('60%');
        expect(el.style.getPropertyValue('--skeleton-h')).toBe('120px');
    });
});
