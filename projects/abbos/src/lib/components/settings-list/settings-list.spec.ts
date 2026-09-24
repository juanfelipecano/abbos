import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CONTROL_SHAPE, CONTROL_SIZE } from '../../config';
import { LucideBell } from '@lucide/angular';
import { AbIcon } from '../icon/icon';
import { AbSegmentedToggle } from '../form/segmented-toggle/segmented-toggle';
import { AbSettingsItem } from './settings-item/settings-item';
import { AbSettingsList } from './settings-list';

@Component({
    imports: [AbSettingsList, AbSettingsItem, AbSegmentedToggle, AbIcon],
    template: `
        <ab-settings-list ariaLabel="Preferences">
            <ab-settings-item
                label="Currency"
                description="Other currencies allowed per account"
                value="COP"
                navigable
                (activated)="activations = activations + 1"
            />
            <ab-settings-item label="Locked" value="x" navigable disabled />
            <ab-settings-item label="Alerts">
                <ab-icon abIcon [icon]="bell" tone="info" appearance="solid" />
            </ab-settings-item>
            <ab-settings-item label="Decimals" description="Pesos are whole numbers">
                <ab-segmented-toggle
                    abControl
                    startLabel="0"
                    endLabel="2"
                    ariaLabel="Decimals"
                    [(checked)]="twoDecimals"
                />
            </ab-settings-item>
        </ab-settings-list>
    `,
})
class TestHost {
    protected readonly bell = LucideBell;
    public activations = 0;
    public readonly twoDecimals = signal(false);
}

describe('AbSettingsList', () => {
    let fixture: ComponentFixture<TestHost>;
    let root: HTMLElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TestHost],
            providers: [
                { provide: CONTROL_SIZE, useValue: 'md' },
                { provide: CONTROL_SHAPE, useValue: 'round' },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(TestHost);
        await fixture.whenStable();
        root = fixture.nativeElement;
    });

    const items = () => Array.from(root.querySelectorAll<HTMLElement>('ab-settings-item'));

    it('exposes a labelled list of listitems', () => {
        const list = root.querySelector('ab-settings-list')!;
        expect(list.getAttribute('role')).toBe('list');
        expect(list.getAttribute('aria-label')).toBe('Preferences');
        expect(items().every((i) => i.getAttribute('role') === 'listitem')).toBe(true);
    });

    it('renders label, description and value', () => {
        const [currency] = items();
        expect(currency.querySelector('.ab-settings-item-label')?.textContent).toBe('Currency');
        expect(currency.querySelector('.ab-settings-item-description')?.textContent).toBe(
            'Other currencies allowed per account',
        );
        expect(currency.querySelector('.ab-settings-item-value')?.textContent).toBe('COP');
    });

    it('renders a navigable row as a button with a chevron and describes it', () => {
        const [currency] = items();
        const button = currency.querySelector('button')!;
        const description = currency.querySelector('.ab-settings-item-description')!;
        expect(button.getAttribute('aria-describedby')).toBe(description.id);
        expect(currency.querySelector('.ab-settings-item-chevron')).not.toBeNull();
    });

    it('emits activated when a navigable row is clicked', async () => {
        items()[0].querySelector('button')!.click();
        await fixture.whenStable();
        expect(fixture.componentInstance.activations).toBe(1);
    });

    it('does not emit for a disabled navigable row', async () => {
        const button = items()[1].querySelector('button')!;
        expect(button.disabled).toBe(true);
        button.click();
        await fixture.whenStable();
        expect(fixture.componentInstance.activations).toBe(0);
    });

    it('renders the chevron via ab-icon and projects a caller-styled leading icon', () => {
        expect(items()[0].querySelector('ab-icon.ab-settings-item-chevron')).not.toBeNull();
        expect(items()[0].querySelector('ab-icon[abIcon]')).toBeNull();
        expect(items()[2].querySelector('ab-icon[abIcon]')?.classList).toContain('ab-icon_solid');
    });

    it('renders a control row without a button or chevron', () => {
        const decimals = items()[3];
        expect(decimals.querySelector('button.ab-settings-item-row')).toBeNull();
        expect(decimals.querySelector('.ab-settings-item-chevron')).toBeNull();
        expect(decimals.querySelector('ab-segmented-toggle')).not.toBeNull();
    });

    it('keeps the projected control operable and two-way bound', async () => {
        const segments = items()[3].querySelectorAll<HTMLButtonElement>('button[role="radio"]');
        segments[1].click();
        await fixture.whenStable();
        expect(fixture.componentInstance.twoDecimals()).toBe(true);
        expect(fixture.componentInstance.activations).toBe(0);
    });
});
