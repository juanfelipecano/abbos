import { Component, computed } from '@angular/core';
import {
    LucideBell,
    LucideIconInput,
    LucideMail,
    LucideShieldCheck,
    LucideTriangleAlert,
    LucideUser,
} from '@lucide/angular';
import { AbIcon } from 'abbos';
import { PlaygroundFrame } from '../../../shared/ui/playground-frame/playground-frame';
import { attrs, PlaygroundState } from '../../../shared/ui/playground-frame/playground-state';

const ICONS: Record<string, LucideIconInput> = {
    Mail: LucideMail,
    Bell: LucideBell,
    ShieldCheck: LucideShieldCheck,
    TriangleAlert: LucideTriangleAlert,
    User: LucideUser,
};

@Component({
    selector: 'app-icon-playground',
    imports: [PlaygroundFrame, AbIcon],
    template: `
        <app-playground-frame [model]="state" [code]="code()" fileName="icon-playground.html">
            @let s = state.value();
            <ab-icon
                [icon]="icon()"
                [tone]="$any(s.tone)"
                [appearance]="$any(s.appearance)"
                [size]="$any(s.size)"
                [shape]="$any(s.shape)"
                [label]="s.label || null"
            />
        </app-playground-frame>
    `,
})
export class IconPlayground {
    protected readonly state = new PlaygroundState(
        {
            icon: 'Mail',
            tone: 'primary',
            appearance: 'soft',
            size: 'lg',
            shape: 'circle',
            label: '',
        },
        [
            { kind: 'select', key: 'icon', label: 'Icon', options: Object.keys(ICONS) },
            {
                kind: 'select',
                key: 'tone',
                label: 'Tone',
                options: ['primary', 'success', 'info', 'warning', 'danger', 'neutral'],
            },
            {
                kind: 'select',
                key: 'appearance',
                label: 'Appearance',
                options: ['soft', 'solid', 'outline', 'clear'],
            },
            { kind: 'select', key: 'size', label: 'Size', options: ['sm', 'md', 'lg', 'xl'] },
            {
                kind: 'select',
                key: 'shape',
                label: 'Shape',
                options: ['square', 'round', 'circle'],
            },
            { kind: 'text', key: 'label', label: 'Label (meaningful icons)' },
        ],
    );

    protected readonly icon = computed(() => ICONS[this.state.value().icon]);

    protected readonly code = computed(() => {
        const s = this.state.value();
        const list = attrs(
            `[icon]="${s.icon}"`,
            s.tone !== 'success' && `tone="${s.tone}"`,
            s.appearance !== 'clear' && `appearance="${s.appearance}"`,
            s.size !== 'sm' && `size="${s.size}"`,
            s.shape !== 'circle' && `shape="${s.shape}"`,
            s.label && `label="${s.label}"`,
        );
        return `<!-- ${s.icon} = Lucide${s.icon} from '@lucide/angular' -->\n<ab-icon ${list} />`;
    });
}
