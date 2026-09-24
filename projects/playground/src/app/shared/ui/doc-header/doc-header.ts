import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideChevronRight, LucideFlag, LucideTriangleAlert } from '@lucide/angular';
import { CATEGORIES } from '../../../core/docs/categories';
import { DocEntry } from '../../../core/docs/doc.model';
import { categoryPath } from '../../../core/docs/docs-registry';
import { SITE_LINKS } from '../../../core/docs/site';
import { GithubMark } from '../github-mark';
import { StatusBadge } from '../status-badge/status-badge';

/** Breadcrumb, title, badges and source links at the top of every doc page. */
@Component({
    selector: 'app-doc-header',
    imports: [
        RouterLink,
        StatusBadge,
        GithubMark,
        LucideChevronRight,
        LucideFlag,
        LucideTriangleAlert,
    ],
    templateUrl: './doc-header.html',
    styleUrl: './doc-header.scss',
})
export class DocHeader {
    public readonly entry = input.required<DocEntry>();

    protected readonly category = computed(() => CATEGORIES[this.entry().category]);
    protected readonly categoryPath = computed(() => categoryPath(this.entry().category));
    protected readonly sourceUrl = computed(() => {
        const path = this.entry().sourcePath;
        return path ? SITE_LINKS.source(path) : null;
    });
    protected readonly issueUrl = computed(
        () => `${SITE_LINKS.newIssue}?title=${encodeURIComponent(`[${this.entry().title}] `)}`,
    );
}
