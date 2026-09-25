import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
    afterNextRender,
    ApplicationRef,
    Component,
    ComponentRef,
    createComponent,
    EnvironmentInjector,
    inject,
    Injectable,
    OnDestroy,
    output,
    signal,
    Signal,
} from '@angular/core';
import { AsyncSubject, Observable, Subject } from 'rxjs';
import { AbToast, AbToastSeverity } from './toast';

/** Why a toast went away: it timed out, the user took its action, or it was dismissed. */
export type AbToastDismissReason = 'timeout' | 'action' | 'dismiss';

/** Where on the screen a toast appears. */
export type AbToastPosition =
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right'
    | 'center';

/**
 * How the toasts of one position are shown.
 * - `queue`: one at a time, the rest wait (Material 3).
 * - `stacked`: up to `maxVisible` in a pile that fans out while the pointer or focus is on it.
 * - `expanded`: up to `maxVisible`, always fully shown in a list.
 */
export type AbToastMode = 'queue' | 'stacked' | 'expanded';

const DEFAULT_POSITION: AbToastPosition = 'bottom-center';
const DEFAULT_DURATION_MS = 4000;
const DEFAULT_ACTION_DURATION_MS = 8000;
const DEFAULT_MAX_VISIBLE = 3;
/** Mirrors the exit transition in toast.scss (`--ab-dur-normal`). */
const EXIT_DURATION_MS = 200;

export interface AbToastConfig {
    message: string;
    /** Label of the single text action. */
    actionLabel?: string;
    severity?: AbToastSeverity;
    /** Where it appears. Defaults to `bottom-center`, the Material 3 placement. */
    position?: AbToastPosition;
    /**
     * How the toasts at this position are shown. Defaults to `queue`. The mode belongs to the
     * position: the latest toast shown there decides it, so don't mix modes in one position.
     */
    mode?: AbToastMode;
    /** `stacked` and `expanded` only: how many show at once; the rest wait. Defaults to 3. */
    maxVisible?: number;
    /**
     * Milliseconds before it dismisses itself. Defaults to 4000, or 8000 when there is an action.
     * `0` keeps it until the user closes it or takes the action.
     */
    duration?: number;
    /** Shows a close button. Always on for a persistent toast without an action. */
    dismissible?: boolean;
    closeLabel?: string;
}

/** Handle to a toast that is showing or waiting in the queue. */
export class AbToastRef {
    private readonly _dismissed = new AsyncSubject<AbToastDismissReason>();
    private readonly _action = new Subject<void>();
    private _closing = false;
    private _reason: AbToastDismissReason = 'dismiss';

    /** @internal */
    constructor(private readonly _requestDismiss: () => void) {}

    /** Dismisses the toast, or removes it from the queue. Only the first call counts. */
    public dismiss(): void {
        this._dismissWith('dismiss');
    }

    /** Emits once, after the exit transition, with why it went away. Then completes. */
    public afterDismissed(): Observable<AbToastDismissReason> {
        return this._dismissed.asObservable();
    }

    /** Emits once when the user takes the action, right before the toast dismisses. */
    public onAction(): Observable<void> {
        return this._action.asObservable();
    }

    /** @internal */
    public _dismissWith(reason: AbToastDismissReason): void {
        if (this._closing) {
            return;
        }
        this._closing = true;
        this._reason = reason;
        if (reason === 'action') {
            this._action.next();
        }
        this._requestDismiss();
    }

    /** @internal */
    public _finish(): void {
        this._closing = true;
        this._dismissed.next(this._reason);
        this._dismissed.complete();
        this._action.complete();
    }
}

interface Entry {
    id: number;
    config: AbToastConfig;
    ref: AbToastRef;
    position: AbToastPosition;
    leaving: Signal<boolean>;
    setLeaving(value: boolean): void;
    remaining: number;
    startedAt: number;
    timer: ReturnType<typeof setTimeout> | undefined;
    exitTimer: ReturnType<typeof setTimeout> | undefined;
}

interface Container {
    position: AbToastPosition;
    mode: AbToastMode;
    maxVisible: number;
    queue: Entry[];
    visible: Entry[];
    hover: boolean;
    focus: boolean;
}

interface ToastView {
    id: number;
    config: AbToastConfig;
    leaving: Signal<boolean>;
    /** 0 for the newest toast, growing towards the oldest. Drives the stacked pile. */
    depth: number;
}

interface ContainerView {
    position: AbToastPosition;
    mode: AbToastMode;
    expanded: boolean;
    /** Polite region; error toasts go to `alert`. Each is in visual order. */
    status: ToastView[];
    alert: ToastView[];
}

interface HoldChange {
    position: AbToastPosition;
    source: 'hover' | 'focus';
    on: boolean;
}

/**
 * The single host for every position. Each position's live regions exist (empty) before its
 * first toast is put in them, which is what makes screen readers announce what appears.
 */
@Component({
    selector: 'ab-toast-outlet',
    imports: [AbToast, NgTemplateOutlet],
    styleUrl: './toast-outlet.scss',
    template: `
        @for (container of containers(); track container.position) {
            <section
                class="ab-toast-container"
                [attr.data-position]="container.position"
                [attr.data-mode]="container.mode"
                [class.ab-toast-container_expanded]="container.expanded"
            >
                <div
                    class="ab-toast-column"
                    (mouseenter)="
                        hold.emit({ position: container.position, source: 'hover', on: true })
                    "
                    (mouseleave)="
                        hold.emit({ position: container.position, source: 'hover', on: false })
                    "
                    (focusin)="
                        hold.emit({ position: container.position, source: 'focus', on: true })
                    "
                    (focusout)="
                        hold.emit({ position: container.position, source: 'focus', on: false })
                    "
                >
                    <div
                        class="ab-toast-stack"
                        [class.ab-toast-stack_filled]="container.alert.length"
                        role="alert"
                        aria-live="assertive"
                        aria-atomic="false"
                    >
                        <ng-container
                            [ngTemplateOutlet]="items"
                            [ngTemplateOutletContext]="{ container, toasts: container.alert }"
                        />
                    </div>
                    <div
                        class="ab-toast-stack"
                        [class.ab-toast-stack_filled]="container.status.length"
                        role="status"
                        aria-live="polite"
                        aria-atomic="false"
                    >
                        <ng-container
                            [ngTemplateOutlet]="items"
                            [ngTemplateOutletContext]="{ container, toasts: container.status }"
                        />
                    </div>
                </div>
            </section>
        }
        <ng-template #items let-container="container" let-toasts="toasts">
            @for (toast of toasts; track toast.id) {
                @let folded =
                    container.mode === 'stacked' && !container.expanded && toast.depth > 0;
                <div
                    class="ab-toast-item"
                    [style.--ab-toast-depth]="toast.depth"
                    [attr.inert]="folded ? '' : null"
                    [attr.aria-hidden]="folded ? 'true' : null"
                >
                    <ab-toast
                        [message]="toast.config.message"
                        [actionLabel]="toast.config.actionLabel"
                        [severity]="toast.config.severity ?? 'neutral'"
                        [dismissible]="dismissible(toast.config)"
                        [closeLabel]="toast.config.closeLabel ?? 'Dismiss'"
                        [leaving]="toast.leaving()"
                        (action)="action.emit(toast.id)"
                        (dismissed)="dismissed.emit(toast.id)"
                    />
                </div>
            }
        </ng-template>
    `,
})
class AbToastOutlet {
    public readonly containers = signal<ContainerView[]>([]);

    public readonly action = output<number>();
    public readonly dismissed = output<number>();
    /** The pointer or keyboard focus entered or left a position's toasts. */
    public readonly hold = output<HoldChange>();

    protected dismissible(config: AbToastConfig): boolean {
        return config.dismissible ?? (config.duration === 0 && !config.actionLabel);
    }
}

/**
 * Shows short, non-blocking messages. By default (Material 3 "snackbar" behaviour) one at a time
 * with the rest queued; `stacked` and `expanded` modes show several at once. Focus is never
 * moved. Timers pause while the pointer or keyboard focus is on a position's toasts.
 *
 * Toasts are hosted on `document.body`, so a `data-ab-theme` scoped to a subtree is not
 * inherited; a theme on `<html>` or `<body>` is.
 */
@Injectable({ providedIn: 'root' })
export class AbToastController implements OnDestroy {
    private readonly _appRef = inject(ApplicationRef);
    private readonly _env = inject(EnvironmentInjector);
    private readonly _document = inject(DOCUMENT);
    private readonly _containers = new Map<AbToastPosition, Container>();
    private _outlet: ComponentRef<AbToastOutlet> | undefined;
    private _hostElement: HTMLElement | undefined;
    private _nextId = 0;

    public show(config: AbToastConfig | string): AbToastRef {
        const resolved = typeof config === 'string' ? { message: config } : config;
        const position = resolved.position ?? DEFAULT_POSITION;
        const outlet = this._ensureOutlet();
        const fresh = !this._containers.has(position);
        const container = this._containers.get(position) ?? {
            position,
            mode: 'queue' as AbToastMode,
            maxVisible: 1,
            queue: [],
            visible: [],
            hover: false,
            focus: false,
        };
        this._containers.set(position, container);
        container.mode = resolved.mode ?? 'queue';
        container.maxVisible =
            container.mode === 'queue'
                ? 1
                : Math.max(1, Math.floor(resolved.maxVisible ?? DEFAULT_MAX_VISIBLE));

        const leaving = signal(false);
        const entry: Entry = {
            id: this._nextId++,
            config: resolved,
            ref: new AbToastRef(() => this._request(entry)),
            position,
            leaving,
            setLeaving: (value) => leaving.set(value),
            remaining: 0,
            startedAt: 0,
            timer: undefined,
            exitTimer: undefined,
        };
        container.queue.push(entry);

        if (fresh) {
            // Render the empty live regions first, so the first message is announced.
            this._publish();
            afterNextRender(() => this._fill(container), { injector: outlet.injector });
        } else {
            this._fill(container);
        }
        return entry.ref;
    }

    public success(
        message: string,
        config?: Omit<AbToastConfig, 'message' | 'severity'>,
    ): AbToastRef {
        return this.show({ ...config, message, severity: 'success' });
    }

    public info(message: string, config?: Omit<AbToastConfig, 'message' | 'severity'>): AbToastRef {
        return this.show({ ...config, message, severity: 'info' });
    }

    public error(
        message: string,
        config?: Omit<AbToastConfig, 'message' | 'severity'>,
    ): AbToastRef {
        return this.show({ ...config, message, severity: 'error' });
    }

    /** Dismisses the newest toast on screen. The next one waiting in its position appears. */
    public dismiss(): void {
        let newest: Entry | undefined;
        for (const container of this._containers.values()) {
            for (const entry of container.visible) {
                if (!entry.leaving() && (!newest || entry.id > newest.id)) {
                    newest = entry;
                }
            }
        }
        newest?.ref.dismiss();
    }

    /** Dismisses every toast on screen and drops everything waiting. */
    public dismissAll(): void {
        for (const container of this._containers.values()) {
            for (const entry of [...container.queue, ...container.visible]) {
                entry.ref.dismiss();
            }
        }
    }

    public ngOnDestroy(): void {
        for (const container of this._containers.values()) {
            for (const entry of [...container.queue, ...container.visible]) {
                clearTimeout(entry.timer);
                clearTimeout(entry.exitTimer);
                entry.ref._finish();
            }
        }
        this._containers.clear();
        if (this._outlet) {
            this._appRef.detachView(this._outlet.hostView);
            this._outlet.destroy();
            this._hostElement?.remove();
            this._outlet = undefined;
            this._hostElement = undefined;
        }
    }

    private _request(entry: Entry): void {
        const container = this._containers.get(entry.position);
        if (!container) {
            return;
        }
        const queued = container.queue.indexOf(entry);
        if (queued >= 0) {
            container.queue.splice(queued, 1);
            entry.ref._finish();
            return;
        }
        if (!container.visible.includes(entry)) {
            return;
        }
        clearTimeout(entry.timer);
        entry.timer = undefined;
        entry.setLeaving(true);
        entry.exitTimer = setTimeout(() => {
            container.visible.splice(container.visible.indexOf(entry), 1);
            if (container.visible.length === 0) {
                // Nothing left under the pointer to report leaving.
                container.hover = false;
                container.focus = false;
            }
            this._publish();
            entry.ref._finish();
            this._fill(container);
        }, EXIT_DURATION_MS);
    }

    private _fill(container: Container): void {
        const held = container.hover || container.focus;
        while (container.visible.length < container.maxVisible && container.queue.length > 0) {
            const entry = container.queue.shift() as Entry;
            container.visible.push(entry);
            const duration =
                entry.config.duration ??
                (entry.config.actionLabel ? DEFAULT_ACTION_DURATION_MS : DEFAULT_DURATION_MS);
            entry.remaining = duration > 0 && Number.isFinite(duration) ? duration : 0;
            if (!held) {
                this._arm(entry);
            }
        }
        this._publish();
    }

    private _arm(entry: Entry): void {
        if (entry.remaining > 0 && entry.timer === undefined && !entry.leaving()) {
            entry.startedAt = Date.now();
            entry.timer = setTimeout(() => {
                entry.timer = undefined;
                entry.ref._dismissWith('timeout');
            }, entry.remaining);
        }
    }

    private _pause(entry: Entry): void {
        if (entry.timer !== undefined) {
            clearTimeout(entry.timer);
            entry.timer = undefined;
            entry.remaining = Math.max(0, entry.remaining - (Date.now() - entry.startedAt));
        }
    }

    private _hold({ position, source, on }: HoldChange): void {
        const container = this._containers.get(position);
        if (!container) {
            return;
        }
        container[source] = on;
        const held = container.hover || container.focus;
        for (const entry of container.visible) {
            if (held) {
                this._pause(entry);
            } else {
                this._arm(entry);
            }
        }
        this._publish();
    }

    private _publish(): void {
        const views: ContainerView[] = [...this._containers.values()].map((container) => {
            const top = container.position.startsWith('top');
            const split = (errors: boolean): ToastView[] => {
                const entries = container.visible.filter(
                    (entry) => (entry.config.severity === 'error') === errors,
                );
                const views = entries.map((entry, index) => ({
                    id: entry.id,
                    config: entry.config,
                    leaving: entry.leaving,
                    depth: entries.length - 1 - index,
                }));
                // Newest sits nearest the edge the toasts are anchored to.
                return top ? views.reverse() : views;
            };
            return {
                position: container.position,
                mode: container.mode,
                expanded: container.mode === 'expanded' || container.hover || container.focus,
                status: split(false),
                alert: split(true),
            };
        });
        this._outlet?.instance.containers.set(views);
    }

    private _find(id: number): Entry | undefined {
        for (const container of this._containers.values()) {
            const entry = container.visible.find((candidate) => candidate.id === id);
            if (entry) {
                return entry;
            }
        }
        return undefined;
    }

    private _ensureOutlet(): ComponentRef<AbToastOutlet> {
        if (this._outlet) {
            return this._outlet;
        }
        const hostElement = this._document.createElement('ab-toast-outlet');
        this._document.body.appendChild(hostElement);
        const outlet = createComponent(AbToastOutlet, {
            environmentInjector: this._env,
            hostElement,
        });
        outlet.instance.action.subscribe((id) => this._find(id)?.ref._dismissWith('action'));
        outlet.instance.dismissed.subscribe((id) => this._find(id)?.ref._dismissWith('dismiss'));
        outlet.instance.hold.subscribe((change) => this._hold(change));
        this._appRef.attachView(outlet.hostView);
        this._outlet = outlet;
        this._hostElement = hostElement;
        return outlet;
    }
}
