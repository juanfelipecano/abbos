import { Component, computed, DOCUMENT, inject, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideMenu, LucideMoon, LucideSearch, LucideSun } from '@lucide/angular';
import { AbThemeService } from 'abbos';
import { CATEGORIES, CATEGORY_ORDER } from '../../core/docs/categories';
import { categoryPath } from '../../core/docs/docs-registry';
import { SITE_LINKS } from '../../core/docs/site';
import { Viewport } from '../../core/layout/viewport';
import { Search } from '../../core/search/search';
import { GithubMark } from '../../shared/ui/github-mark';
import { IconButton } from '../../shared/ui/icon-button/icon-button';
import { Logo } from '../logo/logo';
import { VersionMenu } from '../version-menu/version-menu';

@Component({
    selector: 'app-header',
    imports: [
        RouterLink,
        RouterLinkActive,
        Logo,
        VersionMenu,
        IconButton,
        GithubMark,
        LucideMenu,
        LucideSearch,
        LucideSun,
        LucideMoon,
    ],
    templateUrl: './header.html',
    styleUrl: './header.scss',
})
export class Header {
    private readonly theme = inject(AbThemeService);
    protected readonly search = inject(Search);
    protected readonly isMobile = inject(Viewport).isMobile;

    public readonly menu = output<void>();

    protected readonly links = CATEGORY_ORDER.map((id) => ({
        label: CATEGORIES[id].title,
        path: categoryPath(id),
    }));
    protected readonly site = SITE_LINKS;
    protected readonly shortcut = /Mac|iPhone|iPad/.test(
        inject(DOCUMENT).defaultView?.navigator.userAgent ?? '',
    )
        ? '⌘K'
        : 'Ctrl K';
    protected readonly isDark = computed(() => this.theme.theme() === 'dark');

    protected toggleTheme(): void {
        this.theme.toggleTheme();
    }
}
