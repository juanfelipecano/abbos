import { Component } from '@angular/core';
import { AbIcon } from 'abbos';
import {
    LucideCircleAlert,
    LucideInfo,
    LucideMail,
    LucideShieldCheck,
    LucideTriangleAlert,
    LucideUser,
} from '@lucide/angular';

@Component({
    selector: 'app-icon-demo',
    imports: [AbIcon],
    template: `
        <main
            style="display: flex; flex-direction: column; gap: 1.5rem; padding: 2rem; max-width: 640px;"
        >
            <h1>AbIcon</h1>

            <section style="display: flex; flex-direction: column; gap: 0.75rem;">
                <h2>Default (success, clear)</h2>
                <ab-icon [icon]="Mail" label="Email sent" />
            </section>

            <section style="display: flex; flex-direction: column; gap: 0.75rem;">
                <h2>Tone</h2>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <ab-icon [icon]="ShieldCheck" tone="primary" />
                    <ab-icon [icon]="Mail" tone="success" />
                    <ab-icon [icon]="Info" tone="info" />
                    <ab-icon [icon]="TriangleAlert" tone="warning" />
                    <ab-icon [icon]="CircleAlert" tone="danger" />
                    <ab-icon [icon]="User" tone="neutral" />
                </div>
            </section>

            @for (appearance of appearances; track appearance) {
                <section style="display: flex; flex-direction: column; gap: 0.75rem;">
                    <h2>Appearance: {{ appearance }}</h2>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        @for (tone of tones; track tone) {
                            <ab-icon [icon]="Mail" [tone]="tone" [appearance]="appearance" />
                        }
                    </div>
                </section>
            }

            <section style="display: flex; flex-direction: column; gap: 0.75rem;">
                <h2>Size</h2>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    @for (size of sizes; track size) {
                        <ab-icon [icon]="Mail" [size]="size" appearance="soft" shape="circle" />
                    }
                </div>
            </section>

            <section style="display: flex; flex-direction: column; gap: 0.75rem;">
                <h2>Shape</h2>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    @for (shape of shapes; track shape) {
                        <ab-icon [icon]="Mail" appearance="soft" [shape]="shape" />
                    }
                </div>
            </section>
        </main>
    `,
})
export class IconDemo {
    protected readonly Mail = LucideMail;
    protected readonly ShieldCheck = LucideShieldCheck;
    protected readonly Info = LucideInfo;
    protected readonly TriangleAlert = LucideTriangleAlert;
    protected readonly CircleAlert = LucideCircleAlert;
    protected readonly User = LucideUser;

    protected readonly tones = [
        'primary',
        'success',
        'info',
        'warning',
        'danger',
        'neutral',
    ] as const;
    protected readonly appearances = ['soft', 'solid', 'outline', 'clear'] as const;
    protected readonly sizes = ['sm', 'md', 'lg', 'xl'] as const;
    protected readonly shapes = ['square', 'round', 'circle'] as const;
}
