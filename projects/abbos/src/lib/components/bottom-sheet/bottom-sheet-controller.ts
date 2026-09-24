import { NgComponentOutlet, DOCUMENT } from '@angular/common';
import {
    afterNextRender,
    ApplicationRef,
    Component,
    ComponentRef,
    createComponent,
    EnvironmentInjector,
    inject,
    Injectable,
    InputSignalWithTransform,
    Injector,
    input,
    ModelSignal,
    OnDestroy,
    output,
    signal,
    Type,
} from '@angular/core';
import { AsyncSubject, Observable } from 'rxjs';
import { AbBottomSheet, AbSheetFooter } from './bottom-sheet';

/** The `input()` and `model()` members of a component, keyed to the value they accept. */
export type AbBottomSheetInputs<C> = {
    [
        K in keyof C as C[K] extends InputSignalWithTransform<any, any> | ModelSignal<any>
            ? K
            : never
    ]?: C[K] extends InputSignalWithTransform<any, infer T>
        ? T
        : C[K] extends ModelSignal<infer M>
          ? M
          : never;
};

export interface AbBottomSheetConfig<C = unknown> {
    /** Title in the header; also the accessible name of the sheet. */
    heading: string;
    subheading?: string;
    showHandle?: boolean;
    /** When false, Esc, the scrim, dragging and the close button are disabled. */
    dismissible?: boolean;
    compact?: boolean;
    closeLabel?: string;
    /** Values for the opened component's `input()`s and `model()`s. */
    inputs?: AbBottomSheetInputs<C>;
    /** Component rendered in the pinned footer. It can inject `AbBottomSheetRef` too. */
    footer?: Type<unknown>;
    /** Parent injector for the opened component. Defaults to the root injector. */
    injector?: Injector;
}

/**
 * Handle to an open sheet. It is also injectable from the opened component (and footer) so they
 * can close the sheet with a result: `inject(AbBottomSheetRef<string>).close('red')`.
 */
export class AbBottomSheetRef<R = unknown> {
    private readonly _closed = new AsyncSubject<R | undefined>();
    private _result: R | undefined;
    private _closing = false;

    /** @internal */
    constructor(private readonly _requestClose: () => void) {}

    /** Closes the sheet. Only the first call counts; later calls and dismissals are ignored. */
    public close(result?: R): void {
        if (this._closing) {
            return;
        }
        this._closing = true;
        this._result = result;
        this._requestClose();
    }

    /**
     * Emits once, after the exit animation, with the result passed to `close()`, or `undefined`
     * when the user dismissed the sheet. Then completes.
     */
    public afterClosed(): Observable<R | undefined> {
        return this._closed.asObservable();
    }

    /** @internal */
    public _finish(): void {
        this._closing = true;
        this._closed.next(this._result);
        this._closed.complete();
    }
}

@Component({
    selector: 'ab-bottom-sheet-outlet',
    imports: [AbBottomSheet, AbSheetFooter, NgComponentOutlet],
    template: `
        <ab-bottom-sheet
            [open]="open()"
            (openChange)="dismissed.emit()"
            (afterClosed)="closed.emit()"
            [heading]="config().heading"
            [subheading]="config().subheading"
            [showHandle]="config().showHandle ?? true"
            [dismissible]="config().dismissible ?? true"
            [compact]="config().compact ?? false"
            [closeLabel]="config().closeLabel ?? 'Close'"
        >
            <ng-container *ngComponentOutlet="content(); inputs: inputs(); injector: injector()" />
            @if (footer(); as footerType) {
                <div abSheetFooter>
                    <ng-container *ngComponentOutlet="footerType; injector: injector()" />
                </div>
            }
        </ab-bottom-sheet>
    `,
})
class AbBottomSheetOutlet {
    public readonly config = input.required<AbBottomSheetConfig>();
    public readonly content = input.required<Type<unknown>>();
    public readonly footer = input<Type<unknown>>();
    public readonly inputs = input<Record<string, unknown>>();
    public readonly injector = input.required<Injector>();
    public readonly open = signal(true);

    /** The user dismissed the sheet (Esc, scrim, drag or the header button). */
    public readonly dismissed = output<void>();
    public readonly closed = output<void>();
}

/**
 * Opens a component in a modal bottom sheet and hands back what it closes with.
 * One sheet at a time: opening another closes the current one (result `undefined`).
 *
 * The sheet is hosted on `document.body`, so a `data-ab-theme` scoped to a subtree is not
 * inherited; a theme on `<html>` or `<body>` is.
 */
@Injectable({ providedIn: 'root' })
export class AbBottomSheetController implements OnDestroy {
    private readonly _appRef = inject(ApplicationRef);
    private readonly _env = inject(EnvironmentInjector);
    private readonly _injector = inject(Injector);
    private readonly _document = inject(DOCUMENT);
    private readonly _active = new Map<AbBottomSheetRef<any>, () => void>();

    public open<C, R = undefined>(
        component: Type<C>,
        config: AbBottomSheetConfig<C>,
    ): AbBottomSheetRef<R> {
        this.closeAll();

        const hostElement = this._document.createElement('ab-bottom-sheet-outlet');
        this._document.body.appendChild(hostElement);
        const outlet: ComponentRef<AbBottomSheetOutlet> = createComponent(AbBottomSheetOutlet, {
            environmentInjector: this._env,
            hostElement,
        });

        // Closing before the first render means nothing was shown, so there is no exit to wait for.
        let rendered = false;
        const ref = new AbBottomSheetRef<R>(() =>
            rendered ? outlet.instance.open.set(false) : cleanup(),
        );
        const cleanup = (): void => {
            this._active.delete(ref);
            this._appRef.detachView(outlet.hostView);
            outlet.destroy();
            hostElement.remove();
            ref._finish();
        };
        this._active.set(ref, cleanup);
        afterNextRender(() => (rendered = true), { injector: outlet.injector });

        outlet.instance.dismissed.subscribe(() => ref.close());
        outlet.instance.closed.subscribe(cleanup);

        outlet.setInput('config', config);
        outlet.setInput('content', component);
        outlet.setInput('footer', config.footer);
        outlet.setInput('inputs', config.inputs);
        outlet.setInput(
            'injector',
            Injector.create({
                parent: config.injector ?? this._injector,
                providers: [{ provide: AbBottomSheetRef, useValue: ref }],
            }),
        );
        this._appRef.attachView(outlet.hostView);
        return ref;
    }

    /** Closes every open sheet; each resolves `undefined`. */
    public closeAll(): void {
        for (const ref of [...this._active.keys()]) {
            ref.close();
        }
    }

    public ngOnDestroy(): void {
        for (const cleanup of [...this._active.values()]) {
            cleanup();
        }
    }
}
