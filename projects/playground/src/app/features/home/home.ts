import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowRight, LucideArrowRightLeft, LucideBox, LucideBraces } from '@lucide/angular';
import { AB_ACCENTS, AbButton, AbThemeService } from 'abbos';
import { CATEGORIES, CATEGORY_ORDER } from '../../core/docs/categories';
import { categoryPath, shippedIn } from '../../core/docs/docs-registry';
import { LIBRARY_VERSION } from '../../core/docs/site';
import { TocEntry } from '../../core/toc/toc-entry';
import { Toc } from '../../core/toc/toc';
import { Callout } from '../../shared/ui/callout/callout';
import { CodeBlock } from '../../shared/ui/code-block/code-block';
import { PrevNext } from '../../shared/ui/prev-next/prev-next';
import { SectionHeading } from '../../shared/ui/section-heading/section-heading';
import { StatusBadge } from '../../shared/ui/status-badge/status-badge';
import { SegOption, SegTabs } from '../../shared/ui/tabs/seg-tabs';
import * as snippets from './home-snippets';

const PACKAGE_MANAGERS: readonly SegOption[] = [
    { value: 'npm', label: 'npm' },
    { value: 'pnpm', label: 'pnpm' },
    { value: 'yarn', label: 'yarn' },
];

@Component({
    selector: 'app-home',
    imports: [
        RouterLink,
        AbButton,
        TocEntry,
        SectionHeading,
        SegTabs,
        CodeBlock,
        Callout,
        StatusBadge,
        PrevNext,
        LucideArrowRight,
        LucideBox,
        LucideBraces,
        LucideArrowRightLeft,
    ],
    templateUrl: './home.html',
    styleUrl: './home.scss',
})
export default class Home {
    private readonly toc = inject(Toc);
    protected readonly theme = inject(AbThemeService);

    protected readonly version = LIBRARY_VERSION;
    protected readonly snippets = snippets;
    protected readonly managers = PACKAGE_MANAGERS;
    protected readonly manager = signal('npm');
    protected readonly accents = AB_ACCENTS;

    protected readonly categories = CATEGORY_ORDER.map((id) => {
        const count = shippedIn(id).length;
        return {
            id,
            path: categoryPath(id),
            title: CATEGORIES[id].title,
            description: CATEGORIES[id].description,
            count: count ? `${count} ${count === 1 ? 'item' : 'items'}` : 'No items yet',
            soon: count === 0,
        };
    });

    protected getStarted(): void {
        this.toc.scrollTo('sec-install');
    }
}
