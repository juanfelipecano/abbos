import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SITE_LINKS } from '../../core/docs/site';
import { Toc } from '../../core/toc/toc';
import { GithubMark } from '../../shared/ui/github-mark';

/** Desktop "On this page" rail with scroll-spy. */
@Component({
    selector: 'app-page-toc',
    imports: [GithubMark],
    template: `
        <nav aria-labelledby="page-toc-title">
            <h2 id="page-toc-title" class="title">On this page</h2>
            <ul>
                @for (section of toc.sections(); track section.id) {
                    <li>
                        <a
                            [href]="href(section.id)"
                            [class.sub]="section.level === 3"
                            [class.active]="section.id === toc.activeId()"
                            [attr.aria-current]="section.id === toc.activeId() ? 'location' : null"
                            (click)="go($event, section.id)"
                            >{{ section.label }}</a
                        >
                    </li>
                }
            </ul>
        </nav>
        <a class="edit" [href]="site.repo" target="_blank" rel="noopener">
            <app-github-mark [size]="16" />Edit this page
        </a>
    `,
    styleUrl: './page-toc.scss',
})
export class PageToc {
    private readonly router = inject(Router);
    protected readonly toc = inject(Toc);
    protected readonly site = SITE_LINKS;

    protected href(id: string): string {
        return `${this.router.url.split('#')[0]}#${id}`;
    }

    protected go(event: MouseEvent, id: string): void {
        event.preventDefault();
        this.toc.scrollTo(id);
    }
}
