import { Component, effect, ElementRef, inject, signal, viewChild } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { LucideX } from '@lucide/angular';
import { LIBRARY_VERSION } from '../../core/docs/site';
import { Viewport } from '../../core/layout/viewport';
import { Search } from '../../core/search/search';
import { Toc } from '../../core/toc/toc';
import { IconButton } from '../../shared/ui/icon-button/icon-button';
import { Header } from '../header/header';
import { Logo } from '../logo/logo';
import { MobileToc } from '../mobile-toc/mobile-toc';
import { PageToc } from '../page-toc/page-toc';
import { SearchDialog } from '../search-dialog/search-dialog';
import { Sidebar } from '../sidebar/sidebar';

/** App frame: header, navigation, content column, "On this page" and the search dialog. */
@Component({
    selector: 'app-shell',
    imports: [
        RouterOutlet,
        Header,
        Sidebar,
        PageToc,
        MobileToc,
        SearchDialog,
        Logo,
        IconButton,
        LucideX,
    ],
    templateUrl: './shell.html',
    styleUrl: './shell.scss',
    host: { '(document:keydown)': 'onKeydown($event)' },
})
export class Shell {
    private readonly router = inject(Router);
    private readonly search = inject(Search);
    protected readonly toc = inject(Toc);
    protected readonly isMobile = inject(Viewport).isMobile;
    protected readonly version = LIBRARY_VERSION;

    private readonly drawer = viewChild.required<ElementRef<HTMLDialogElement>>('drawer');
    private readonly main = viewChild.required<ElementRef<HTMLElement>>('main');

    protected readonly drawerOpen = signal(false);
    /** Category grids get a wider column (set through route data). */
    protected readonly wide = signal(false);

    constructor() {
        effect(() => {
            const drawer = this.drawer().nativeElement;
            const open = this.drawerOpen() && this.isMobile();
            if (open && !drawer.open) {
                drawer.showModal();
            } else if (!open && drawer.open) {
                drawer.close();
            }
        });
    }

    protected onKeydown(event: KeyboardEvent): void {
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
            event.preventDefault();
            this.search.toggle();
        }
    }

    protected onActivate(): void {
        let route = this.router.routerState.snapshot.root;
        while (route.firstChild) {
            route = route.firstChild;
        }
        this.wide.set(route.data['wide'] === true);
        this.drawerOpen.set(false);
    }

    protected skipToContent(event: Event): void {
        event.preventDefault();
        this.main().nativeElement.focus();
    }

    protected onDrawerClick(event: MouseEvent): void {
        if (event.target === this.drawer().nativeElement) {
            this.drawerOpen.set(false);
        }
    }
}
