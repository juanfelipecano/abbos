import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LucideIconInput, LucideMail } from '@lucide/angular';
import { AbControlShape } from '../../constants';
import { AbIcon, AbIconAppearance, AbIconSize, AbIconTone } from './icon';

@Component({
    imports: [AbIcon],
    template: `
        <ab-icon
            [icon]="icon()"
            [tone]="tone()"
            [appearance]="appearance()"
            [size]="size()"
            [shape]="shape()"
            [label]="label()"
        />
    `,
})
class TestHost {
    public icon = signal<LucideIconInput>(LucideMail.icon);
    public tone = signal<AbIconTone>('success');
    public appearance = signal<AbIconAppearance>('clear');
    public size = signal<AbIconSize>('lg');
    public shape = signal<AbControlShape>('circle');
    public label = signal<string | null>(null);
}

describe('AbIcon', () => {
    let fixture: ComponentFixture<TestHost>;
    let host: TestHost;

    const el = (): HTMLElement => fixture.nativeElement.querySelector('ab-icon');

    beforeEach(() => {
        fixture = TestBed.createComponent(TestHost);
        host = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('defaults to success / clear / lg / circle', () => {
        const classes = el().classList;
        expect(classes).toContain('ab-icon');
        expect(classes).toContain('ab-icon_success');
        expect(classes).toContain('ab-icon_clear');
        expect(classes).toContain('ab-icon_lg');
        expect(classes).toContain('ab-icon_circle');
    });

    it('renders the lucide icon as an svg', () => {
        expect(el().querySelector('svg')).not.toBeNull();
        expect(el().querySelectorAll('svg *').length).toBeGreaterThan(0);
    });

    it.each(['primary', 'success', 'info', 'warning', 'danger', 'neutral'] as AbIconTone[])(
        'applies tone %s',
        (tone) => {
            host.tone.set(tone);
            fixture.detectChanges();
            expect(el().classList).toContain(`ab-icon_${tone}`);
        },
    );

    it.each(['soft', 'solid', 'outline', 'clear'] as AbIconAppearance[])(
        'applies appearance %s',
        (a) => {
            host.appearance.set(a);
            fixture.detectChanges();
            expect(el().classList).toContain(`ab-icon_${a}`);
        },
    );

    it.each(['sm', 'md', 'lg', 'xl'] as AbIconSize[])('applies size %s', (size) => {
        host.size.set(size);
        fixture.detectChanges();
        expect(el().classList).toContain(`ab-icon_${size}`);
    });

    it.each(['square', 'round', 'circle'] as AbControlShape[])('applies shape %s', (shape) => {
        host.shape.set(shape);
        fixture.detectChanges();
        expect(el().classList).toContain(`ab-icon_${shape}`);
    });

    it('is decorative without a label', () => {
        expect(el().getAttribute('aria-hidden')).toBe('true');
        expect(el().hasAttribute('role')).toBe(false);
    });

    it('becomes an accessible image with a label', () => {
        host.label.set('Email sent');
        fixture.detectChanges();
        expect(el().getAttribute('role')).toBe('img');
        expect(el().getAttribute('aria-label')).toBe('Email sent');
        expect(el().hasAttribute('aria-hidden')).toBe(false);
    });
});
