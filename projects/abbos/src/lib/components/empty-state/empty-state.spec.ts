import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LucideFolderPlus } from '@lucide/angular';
import { AbIcon } from '../icon/icon';
import { AbEmptyState, AbEmptyStateHeadingLevel, AbEmptyStateSize } from './empty-state';

@Component({
    imports: [AbEmptyState, AbIcon],
    template: `
        <ab-empty-state
            [title]="title()"
            [description]="description()"
            [size]="size()"
            [headingLevel]="headingLevel()"
        >
            @if (media()) {
                <ab-icon abMedia [icon]="icon" />
            }
            @if (actions()) {
                <button abActions type="button">Retry</button>
            }
            <a href="#help">Learn more</a>
        </ab-empty-state>
    `,
})
class TestHost {
    public readonly title = signal('Create your first project');
    public readonly description = signal<string | undefined>('Keep files in one place.');
    protected readonly icon = LucideFolderPlus;
    public readonly size = signal<AbEmptyStateSize>('md');
    public readonly headingLevel = signal<AbEmptyStateHeadingLevel>(3);
    public readonly media = signal(false);
    public readonly actions = signal(true);
}

describe('AbEmptyState', () => {
    let fixture: ComponentFixture<TestHost>;
    let host: TestHost;
    let el: HTMLElement;

    const q = (selector: string) => el.querySelector<HTMLElement>(selector);

    beforeEach(async () => {
        await TestBed.configureTestingModule({ imports: [TestHost] }).compileComponents();
        fixture = TestBed.createComponent(TestHost);
        host = fixture.componentInstance;
        await fixture.whenStable();
        el = fixture.nativeElement.querySelector('ab-empty-state');
    });

    it('is a status live region', () => {
        expect(el.getAttribute('role')).toBe('status');
    });

    it('renders the title as a heading at the requested level and the description', async () => {
        expect(q('.ab-empty-state-title')?.textContent?.trim()).toBe('Create your first project');
        expect(q('.ab-empty-state-title')?.getAttribute('aria-level')).toBe('3');
        expect(q('.ab-empty-state-description')?.textContent).toBe('Keep files in one place.');

        host.headingLevel.set(2);
        host.description.set(undefined);
        await fixture.whenStable();
        expect(q('.ab-empty-state-title')?.getAttribute('aria-level')).toBe('2');
        expect(q('.ab-empty-state-description')).toBeNull();
    });

    it('projects extra body content by default', () => {
        expect(q('.ab-empty-state-body a')?.textContent).toBe('Learn more');
    });

    it('hides the media part when nothing is projected and projects an ab-icon otherwise', async () => {
        expect(q('.ab-empty-state-media')?.children.length).toBe(0);

        host.media.set(true);
        await fixture.whenStable();
        expect(q('.ab-empty-state-media ab-icon')).not.toBeNull();
    });

    it('projects actions', async () => {
        expect(q('.ab-empty-state-actions button')?.textContent).toBe('Retry');

        host.actions.set(false);
        await fixture.whenStable();
        expect(q('.ab-empty-state-actions')?.children.length).toBe(0);
    });

    it('reflects size as a class', async () => {
        expect(el.classList).toContain('ab-empty-state_md');

        host.size.set('sm');
        await fixture.whenStable();
        expect(el.classList).toContain('ab-empty-state_sm');
    });
});
