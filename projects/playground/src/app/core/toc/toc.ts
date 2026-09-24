import { DOCUMENT, inject, Service, signal } from '@angular/core';

export interface TocSection {
    readonly id: string;
    readonly label: string;
    readonly level: 2 | 3;
    readonly element: HTMLElement;
}

/** A heading is "current" once its top passes this line (px from the viewport top). */
const ACTIVE_LINE = 120;

/**
 * "On this page" state for the current route. Headings register themselves through the
 * `appTocEntry` directive, so pages never maintain a TOC list by hand.
 */
@Service()
export class Toc {
    private readonly window = inject(DOCUMENT).defaultView;
    private readonly _sections = signal<TocSection[]>([]);
    private listening = false;
    private frame = 0;

    public readonly sections = this._sections.asReadonly();
    public readonly activeId = signal<string | null>(null);

    public register(section: TocSection): void {
        this._sections.update((list) => [...list, section].sort(byDocumentOrder));
        this.listen();
        this.schedule();
    }

    public unregister(element: HTMLElement): void {
        this._sections.update((list) => list.filter((section) => section.element !== element));
    }

    public scrollTo(id: string): void {
        const section = this._sections().find((item) => item.id === id);
        section?.element.scrollIntoView({ block: 'start' });
        this.activeId.set(id);
    }

    private listen(): void {
        if (this.listening || !this.window) {
            return;
        }
        this.listening = true;
        this.window.addEventListener('scroll', () => this.schedule(), { passive: true });
    }

    private schedule(): void {
        if (!this.window || this.frame) {
            return;
        }
        this.frame = this.window.requestAnimationFrame(() => {
            this.frame = 0;
            this.updateActive();
        });
    }

    private updateActive(): void {
        const sections = this._sections();
        let current = sections[0]?.id ?? null;
        for (const section of sections) {
            if (section.element.getBoundingClientRect().top < ACTIVE_LINE) {
                current = section.id;
            }
        }
        this.activeId.set(current);
    }
}

function byDocumentOrder(a: TocSection, b: TocSection): number {
    return a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
}
