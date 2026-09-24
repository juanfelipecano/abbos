import { Component, signal } from '@angular/core';
import { LucideBell, LucideGlobe } from '@lucide/angular';
import { AbIcon, AbSegmentedToggle, AbSettingsItem, AbSettingsList } from 'abbos';

@Component({
    selector: 'app-settings-list-demo',
    imports: [AbSettingsList, AbSettingsItem, AbSegmentedToggle, AbIcon],
    template: `
        <main
            style="display: flex; flex-direction: column; gap: 1.5rem; padding: 2rem; max-width: 420px;"
        >
            <h1>AbSettingsList</h1>

            <section style="display: flex; flex-direction: column; gap: 0.75rem;">
                <h2>Navigable rows + inline control</h2>
                <ab-settings-list ariaLabel="Preferences">
                    <ab-settings-item
                        label="Currency"
                        description="Other currencies allowed per account"
                        value="COP"
                        navigable
                        (activated)="last.set('Currency')"
                    />
                    <ab-settings-item
                        label="Language & region"
                        value="es-CO"
                        navigable
                        (activated)="last.set('Language & region')"
                    />
                    <ab-settings-item
                        label="Time zone"
                        value="America/Bogotá"
                        navigable
                        (activated)="last.set('Time zone')"
                    />
                    <ab-settings-item label="Decimals" description="Pesos are whole numbers">
                        <!-- The control needs its own accessible name; reuse the row label. -->
                        <ab-segmented-toggle
                            size="sm"
                            abControl
                            startLabel="0"
                            endLabel="2"
                            ariaLabel="Decimals"
                            [(checked)]="twoDecimals"
                        />
                    </ab-settings-item>
                </ab-settings-list>
                <p>
                    Last activated: {{ last() ?? 'none' }} · Decimals: {{ twoDecimals() ? 2 : 0 }}
                </p>
            </section>

            <section style="display: flex; flex-direction: column; gap: 0.75rem;">
                <h2>Leading icon (ab-icon)</h2>
                <ab-settings-list>
                    <ab-settings-item label="Notifications" value="On" navigable>
                        <ab-icon
                            abIcon
                            [icon]="Bell"
                            tone="primary"
                            appearance="soft"
                            shape="round"
                        />
                    </ab-settings-item>
                    <ab-settings-item label="Language" value="Español" navigable>
                        <ab-icon
                            abIcon
                            [icon]="Globe"
                            tone="info"
                            appearance="solid"
                            shape="circle"
                        />
                    </ab-settings-item>
                </ab-settings-list>
            </section>

            <section style="display: flex; flex-direction: column; gap: 0.75rem;">
                <h2>Disabled + long value</h2>
                <ab-settings-list>
                    <ab-settings-item label="Disabled row" value="Unavailable" navigable disabled />
                    <ab-settings-item
                        label="Time zone"
                        description="A long description wraps onto further lines without breaking the row layout."
                        value="America/Argentina/ComodRivadavia"
                        navigable
                    />
                </ab-settings-list>
            </section>
        </main>
    `,
})
export class SettingsListDemo {
    protected readonly Bell = LucideBell;
    protected readonly Globe = LucideGlobe;
    protected readonly last = signal<string | null>(null);
    protected readonly twoDecimals = signal(false);
}
