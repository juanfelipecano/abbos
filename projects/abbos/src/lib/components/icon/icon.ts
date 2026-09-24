import { Component, computed, input } from '@angular/core';
import { LucideDynamicIcon, LucideIconInput } from '@lucide/angular';
import { AbControlShape } from '../../constants';

export type AbIconTone = 'primary' | 'success' | 'info' | 'warning' | 'danger' | 'neutral';
export type AbIconAppearance = 'soft' | 'solid' | 'outline' | 'clear';
export type AbIconSize = 'sm' | 'md' | 'lg' | 'xl';

@Component({
    selector: 'ab-icon',
    imports: [LucideDynamicIcon],
    templateUrl: './icon.html',
    styleUrl: './icon.scss',
    host: {
        class: 'ab-icon',
        '[class.ab-icon_primary]': `tone() === 'primary'`,
        '[class.ab-icon_success]': `tone() === 'success'`,
        '[class.ab-icon_info]': `tone() === 'info'`,
        '[class.ab-icon_warning]': `tone() === 'warning'`,
        '[class.ab-icon_danger]': `tone() === 'danger'`,
        '[class.ab-icon_neutral]': `tone() === 'neutral'`,
        '[class.ab-icon_soft]': `appearance() === 'soft'`,
        '[class.ab-icon_solid]': `appearance() === 'solid'`,
        '[class.ab-icon_outline]': `appearance() === 'outline'`,
        '[class.ab-icon_clear]': `appearance() === 'clear'`,
        '[class.ab-icon_sm]': `size() === 'sm'`,
        '[class.ab-icon_md]': `size() === 'md'`,
        '[class.ab-icon_lg]': `size() === 'lg'`,
        '[class.ab-icon_xl]': `size() === 'xl'`,
        '[class.ab-icon_square]': `shape() === 'square'`,
        '[class.ab-icon_round]': `shape() === 'round'`,
        '[class.ab-icon_circle]': `shape() === 'circle'`,
        '[attr.role]': `label() ? 'img' : null`,
        '[attr.aria-label]': 'label()',
        '[attr.aria-hidden]': `label() ? null : 'true'`,
    },
})
export class AbIcon {
    public readonly icon = input.required<LucideIconInput>();
    public readonly tone = input<AbIconTone>('success');
    public readonly appearance = input<AbIconAppearance>('clear');
    public readonly size = input<AbIconSize>('sm');
    public readonly shape = input<AbControlShape>('circle');
    public readonly strokeWidth = input(2);
    public readonly label = input<string | null>(null);

    protected readonly iconSize = computed(() => ICON_SIZES[this.size()]);
}

const ICON_SIZES: Record<AbIconSize, number> = { sm: 16, md: 22, lg: 32, xl: 40 };
