import { CdkTrapFocus } from '@angular/cdk/a11y';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { NgTemplateOutlet } from '@angular/common';
import {
    afterRenderEffect,
    booleanAttribute,
    Component,
    computed,
    contentChild,
    DestroyRef,
    Directive,
    ElementRef,
    inject,
    input,
    model,
    output,
    signal,
    TemplateRef,
    untracked,
    viewChild,
    ViewContainerRef,
} from '@angular/core';
import { LucideChevronDown, LucideChevronUp, LucideX } from '@lucide/angular';
import { AbVerticalDragTracker } from '../../helpers';
import { AbButton } from '../button/button';
import { AbIcon } from '../icon/icon';

export type AbBottomSheetMode = 'modal' | 'standard';

/** Marks projected content as the sheet footer, pinned below the scrolling body. */
@Directive({ selector: '[abSheetFooter]' })
export class AbSheetFooter {}

const DISMISS_DISTANCE_PX = 96;
const DISMISS_VELOCITY_PX_PER_MS = 0.6;
const EXPAND_DISTANCE_PX = 48;
const EXPAND_VELOCITY_PX_PER_MS = 0.5;
const WRONG_WAY_DAMPING = 5;
const SCRIM_FADE_DISTANCE_PX = 420;
/** Matches the panel transition in the stylesheet, plus a frame of slack. */
const EXIT_DURATION_MS = 280;
const THEME_ATTRIBUTES = ['data-ab-theme', 'data-ab-accent'];

let nextId = 0;

/**
 * Surface anchored to the bottom edge.
 *
 * - `modal` (default) renders in a CDK overlay above a scrim with a focus trap. Esc, a scrim tap,
 *   dragging down and the close button dismiss it.
 * - `standard` stays in the page (positioned with `--ab-bottom-sheet-position`, `fixed` by default)
 *   and collapses to a peek instead of closing. `open` means expanded.
 *
 * Project the body as default content and the footer with `abSheetFooter`. Drag is a shortcut,
 * never the only way: the header button always offers the same action.
 */
@Component({
    selector: 'ab-bottom-sheet',
    imports: [AbButton, AbIcon, CdkTrapFocus, NgTemplateOutlet],
    templateUrl: './bottom-sheet.html',
    styleUrl: './bottom-sheet.scss',
    host: { class: 'ab-bottom-sheet-host' },
})
export class AbBottomSheet {
    private readonly _overlay = inject(Overlay);
    private readonly _vcr = inject(ViewContainerRef);
    private readonly _host = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly _sheet = viewChild.required<TemplateRef<unknown>>('sheet');
    private readonly _tracker = new AbVerticalDragTracker();
    private _overlayRef: OverlayRef | null = null;
    private _exitTimer: ReturnType<typeof setTimeout> | undefined;

    /** Modal: shown. Standard: expanded (otherwise collapsed to the peek). */
    public readonly open = model(false);
    public readonly mode = input<AbBottomSheetMode>('modal');
    public readonly heading = input.required<string>();
    public readonly subheading = input<string>();
    public readonly showHandle = input(true, { transform: booleanAttribute });
    /** Visible height of a collapsed standard sheet, in px. */
    public readonly peekHeight = input(92);
    /** Modal only: when false, Esc, scrim, drag and the close button are disabled. */
    public readonly dismissible = input(true, { transform: booleanAttribute });
    /** Tighter horizontal body padding, for lists of full-width rows. */
    public readonly compact = input(false, { transform: booleanAttribute });
    public readonly closeLabel = input('Close');
    public readonly expandLabel = input('Expand');
    public readonly collapseLabel = input('Collapse');

    /** Modal only: emitted once the exit animation finished and the overlay is gone. */
    public readonly afterClosed = output<void>();

    protected readonly footer = contentChild(AbSheetFooter);
    protected readonly icons = {
        close: LucideX,
        expand: LucideChevronUp,
        collapse: LucideChevronDown,
    };
    protected readonly titleId = `ab-bottom-sheet-title-${nextId++}`;
    protected readonly isModal = computed(() => this.mode() === 'modal');
    protected readonly dy = signal(0);
    protected readonly dragging = signal(false);
    /** Modal only: true once the panel has been mounted and may slide in. */
    private readonly _entered = signal(false);

    protected readonly shown = computed(() => (this.isModal() ? this._entered() : this.open()));
    protected readonly collapsed = computed(() => !this.isModal() && !this.open());
    protected readonly canDrag = computed(() => !this.isModal() || this.dismissible());
    protected readonly scrimOpacity = computed(() =>
        this.isModal() && this._entered()
            ? Math.max(0, 1 - Math.max(0, this.dy()) / SCRIM_FADE_DISTANCE_PX)
            : 0,
    );
    protected readonly actionIcon = computed(() =>
        this.isModal() ? this.icons.close : this.open() ? this.icons.collapse : this.icons.expand,
    );
    protected readonly actionLabel = computed(() =>
        this.isModal()
            ? this.closeLabel()
            : this.open()
              ? this.collapseLabel()
              : this.expandLabel(),
    );

    constructor() {
        afterRenderEffect(() => {
            const present = this.open() && this.isModal();
            untracked(() => (present ? this.present() : this.dismissOverlay()));
        });
        inject(DestroyRef).onDestroy(() => this.disposeOverlay());
    }

    protected onAction(): void {
        if (this.isModal()) {
            this.close();
        } else {
            this.open.update((value) => !value);
        }
    }

    protected onScrimClick(): void {
        if (this.dismissible()) {
            this.close();
        }
    }

    protected onDragStart(event: PointerEvent): void {
        if (!this.canDrag() || event.button > 0 || this.isFromButton(event)) {
            return;
        }
        this._tracker.start(event);
        (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
    }

    protected onDragMove(event: PointerEvent): void {
        const raw = this._tracker.move(event);
        if (raw === null) {
            return;
        }
        // Dragging with the sheet's grain (down to dismiss/collapse, up to expand) follows the
        // pointer; the other way is damped so it feels anchored.
        const withGrain = this.collapsed() ? raw < 0 : raw > 0;
        let dy = withGrain ? raw : raw / WRONG_WAY_DAMPING;
        if (this.collapsed()) {
            dy = Math.max(dy, -this.hiddenHeight());
        }
        this.dragging.set(true);
        this.dy.set(dy);
    }

    protected onDragEnd(event: PointerEvent): void {
        const end = this._tracker.end();
        this.dragging.set(false);
        this.dy.set(0);
        if (!end) {
            if (!this.isModal() && !this.isFromButton(event)) {
                this.open.update((value) => !value);
            }
            return;
        }
        if (this.collapsed()) {
            if (end.delta < -EXPAND_DISTANCE_PX || end.velocity < -EXPAND_VELOCITY_PX_PER_MS) {
                this.open.set(true);
            }
        } else if (end.delta > DISMISS_DISTANCE_PX || end.velocity > DISMISS_VELOCITY_PX_PER_MS) {
            this.isModal() ? this.close() : this.open.set(false);
        }
    }

    protected onDragCancel(): void {
        this._tracker.cancel();
        this.dragging.set(false);
        this.dy.set(0);
    }

    private close(): void {
        this.open.set(false);
    }

    private isFromButton(event: Event): boolean {
        return (event.target as Element | null)?.closest('button') != null;
    }

    private hiddenHeight(): number {
        const panel = this.panelElement();
        return Math.max(0, (panel?.offsetHeight ?? 0) - this.peekHeight());
    }

    private panelElement(): HTMLElement | null {
        const root = this._overlayRef?.overlayElement ?? this._host.nativeElement;
        return root.querySelector('.ab-bottom-sheet-panel');
    }

    private present(): void {
        clearTimeout(this._exitTimer);
        if (!this._overlayRef) {
            const ref = this._overlay.create({
                positionStrategy: this._overlay.position().global(),
                scrollStrategy: this._overlay.scrollStrategies.block(),
                panelClass: 'ab-bottom-sheet-pane',
                disposeOnNavigation: true,
            });
            this.copyThemeTo(ref.overlayElement);
            ref.keydownEvents().subscribe((event) => {
                if (event.key === 'Escape' && this.dismissible()) {
                    event.preventDefault();
                    this.close();
                }
            });
            ref.attach(new TemplatePortal(this._sheet(), this._vcr));
            this._overlayRef = ref;
            // Flush the closed position so the entrance actually transitions.
            this.panelElement()?.getBoundingClientRect();
        }
        this._entered.set(true);
    }

    private dismissOverlay(): void {
        if (!this._overlayRef) {
            return;
        }
        this._entered.set(false);
        clearTimeout(this._exitTimer);
        this._exitTimer = setTimeout(() => {
            this.disposeOverlay();
            this.afterClosed.emit();
        }, EXIT_DURATION_MS);
    }

    private disposeOverlay(): void {
        clearTimeout(this._exitTimer);
        this._overlayRef?.dispose();
        this._overlayRef = null;
        this._entered.set(false);
    }

    /** The overlay lives on `body`, so re-apply any theme/accent scoped to an ancestor. */
    private copyThemeTo(target: HTMLElement): void {
        for (const attribute of THEME_ATTRIBUTES) {
            const value = this._host.nativeElement
                .closest(`[${attribute}]`)
                ?.getAttribute(attribute);
            if (value != null) {
                target.setAttribute(attribute, value);
            }
        }
    }
}
