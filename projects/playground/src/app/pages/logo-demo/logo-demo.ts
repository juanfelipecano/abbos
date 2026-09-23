import { Component } from '@angular/core';
import { AbLogo } from 'abbos';
import {
    LucideCircleAlert,
    LucideInfo,
    LucideMail,
    LucideShieldCheck,
    LucideTriangleAlert,
    LucideUser,
} from '@lucide/angular';

@Component({
    selector: 'app-logo-demo',
    imports: [AbLogo],
    template: `
        <main
            style="display: flex; flex-direction: column; gap: 1.5rem; padding: 2rem; max-width: 640px;"
        >
            <h1>AbLogo</h1>

            <section style="display: flex; flex-direction: column; gap: 0.75rem;">
                <h2>Default (success, clear)</h2>
                <ab-logo [icon]="Mail" label="Email sent" />
            </section>

            <section style="display: flex; flex-direction: column; gap: 0.75rem;">
                <h2>Tone</h2>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <ab-logo [icon]="ShieldCheck" tone="primary" />
                    <ab-logo [icon]="Mail" tone="success" />
                    <ab-logo [icon]="Info" tone="info" />
                    <ab-logo [icon]="TriangleAlert" tone="warning" />
                    <ab-logo [icon]="CircleAlert" tone="danger" />
                    <ab-logo [icon]="User" tone="neutral" />
                </div>
            </section>

            @for (appearance of appearances; track appearance) {
                <section style="display: flex; flex-direction: column; gap: 0.75rem;">
                    <h2>Appearance: {{ appearance }}</h2>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        @for (tone of tones; track tone) {
                            <ab-logo [icon]="Mail" [tone]="tone" [appearance]="appearance" />
                        }
                    </div>
                </section>
            }

            <section style="display: flex; flex-direction: column; gap: 0.75rem;">
                <h2>Size</h2>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    @for (size of sizes; track size) {
                        <ab-logo [icon]="Mail" [size]="size" />
                    }
                </div>
            </section>

            <section style="display: flex; flex-direction: column; gap: 0.75rem;">
                <h2>Shape</h2>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    @for (shape of shapes; track shape) {
                        <ab-logo [icon]="Mail" [shape]="shape" />
                    }
                </div>
            </section>
        </main>
    `,
})
export class LogoDemo {
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
