import { Component } from '@angular/core';
import { LucideBell, LucideMail, LucideShieldCheck, LucideUser } from '@lucide/angular';
import { AbIcon } from 'abbos';
import { BestPractice } from '../../../core/docs/doc.model';

@Component({
    imports: [AbIcon],
    template: `
        <ab-icon [icon]="Bell" tone="primary" appearance="soft" size="md" />
        <ab-icon [icon]="Mail" tone="primary" appearance="soft" size="md" />
        <ab-icon [icon]="User" tone="primary" appearance="soft" size="md" />
    `,
    host: { class: 'pg-row' },
})
class Consistent {
    protected readonly Bell = LucideBell;
    protected readonly Mail = LucideMail;
    protected readonly User = LucideUser;
}

@Component({
    imports: [AbIcon],
    template: `
        <ab-icon [icon]="Bell" tone="danger" appearance="solid" size="md" />
        <ab-icon [icon]="Mail" tone="info" appearance="outline" size="md" />
        <ab-icon [icon]="Shield" tone="warning" appearance="soft" size="md" shape="square" />
    `,
    host: { class: 'pg-row' },
})
class Mixed {
    protected readonly Bell = LucideBell;
    protected readonly Mail = LucideMail;
    protected readonly Shield = LucideShieldCheck;
}

export const ICON_BEST_PRACTICES: readonly BestPractice[] = [
    { ok: true, text: 'Keep one tone and appearance across a group.', component: Consistent },
    {
        ok: false,
        text: 'Mix tones for decoration — colour should carry status, not variety.',
        component: Mixed,
    },
];
