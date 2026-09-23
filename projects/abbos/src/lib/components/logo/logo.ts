import { Component, computed, input } from '@angular/core';
import { LucideDynamicIcon, LucideIconInput } from '@lucide/angular';
import { AbControlShape } from '../../constants';

export type AbLogoTone = 'primary' | 'success' | 'info' | 'warning' | 'danger' | 'neutral';
export type AbLogoAppearance = 'soft' | 'solid' | 'outline' | 'clear';
export type AbLogoSize = 'sm' | 'md' | 'lg' | 'xl';

@Component({
    selector: 'ab-logo',
    imports: [LucideDynamicIcon],
    templateUrl: './logo.html',
    styleUrl: './logo.scss',
    host: {
        class: 'ab-logo',
        '[class.ab-logo_primary]': `tone() === 'primary'`,
        '[class.ab-logo_success]': `tone() === 'success'`,
        '[class.ab-logo_info]': `tone() === 'info'`,
        '[class.ab-logo_warning]': `tone() === 'warning'`,
        '[class.ab-logo_danger]': `tone() === 'danger'`,
        '[class.ab-logo_neutral]': `tone() === 'neutral'`,
        '[class.ab-logo_soft]': `appearance() === 'soft'`,
        '[class.ab-logo_solid]': `appearance() === 'solid'`,
        '[class.ab-logo_outline]': `appearance() === 'outline'`,
        '[class.ab-logo_clear]': `appearance() === 'clear'`,
        '[class.ab-logo_sm]': `size() === 'sm'`,
        '[class.ab-logo_md]': `size() === 'md'`,
        '[class.ab-logo_lg]': `size() === 'lg'`,
        '[class.ab-logo_xl]': `size() === 'xl'`,
        '[class.ab-logo_square]': `shape() === 'square'`,
        '[class.ab-logo_round]': `shape() === 'round'`,
        '[class.ab-logo_circle]': `shape() === 'circle'`,
        '[attr.role]': `label() ? 'img' : null`,
        '[attr.aria-label]': 'label()',
        '[attr.aria-hidden]': `label() ? null : 'true'`,
    },
})
export class AbLogo {
    public readonly icon = input.required<LucideIconInput>();
    public readonly tone = input<AbLogoTone>('success');
    public readonly appearance = input<AbLogoAppearance>('clear');
    public readonly size = input<AbLogoSize>('sm');
    public readonly shape = input<AbControlShape>('circle');
    public readonly strokeWidth = input(2);
    public readonly label = input<string | null>(null);

    protected readonly iconSize = computed(() => ICON_SIZES[this.size()]);
}

const ICON_SIZES: Record<AbLogoSize, number> = { sm: 16, md: 22, lg: 32, xl: 40 };
