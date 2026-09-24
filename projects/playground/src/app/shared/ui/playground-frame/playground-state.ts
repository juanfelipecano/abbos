import { Signal, signal, WritableSignal } from '@angular/core';

export type PlaygroundValue = string | boolean;

type KeysOf<T, V> = { [K in keyof T]: T[K] extends V ? K : never }[keyof T] & string;

export type PlaygroundControl<T> =
    | {
          readonly kind: 'select';
          readonly key: KeysOf<T, string>;
          readonly label: string;
          readonly options: readonly string[];
      }
    | { readonly kind: 'toggle'; readonly key: KeysOf<T, boolean>; readonly label: string }
    | { readonly kind: 'text'; readonly key: KeysOf<T, string>; readonly label: string };

/** A control with its key erased to `string`, as the frame sees it. */
export type AnyPlaygroundControl =
    | {
          readonly kind: 'select';
          readonly key: string;
          readonly label: string;
          readonly options: readonly string[];
      }
    | { readonly kind: 'toggle' | 'text'; readonly key: string; readonly label: string };

/** Literal `false`/`'md'` initial values widen to `boolean`/`string`. */
type Widen<T> = { [K in keyof T]: T[K] extends boolean ? boolean : string };

/** What `PlaygroundFrame` needs, without the per-component generic. */
export interface PlaygroundModel {
    readonly controls: readonly AnyPlaygroundControl[];
    read(key: string): PlaygroundValue;
    write(key: string, value: PlaygroundValue): void;
    reset(): void;
}

/**
 * Typed state behind a component playground: the current inputs, the controls that edit them,
 * and a reset. Each playground builds one and derives its preview and code from `value()`.
 */
export class PlaygroundState<T extends Record<string, PlaygroundValue>> implements PlaygroundModel {
    private readonly _value: WritableSignal<Widen<T>>;
    public readonly value: Signal<Widen<T>>;
    private readonly initial: Widen<T>;

    constructor(
        initial: T,
        public readonly controls: readonly PlaygroundControl<T>[],
    ) {
        this.initial = { ...initial } as Widen<T>;
        this._value = signal(this.initial);
        this.value = this._value.asReadonly();
    }

    public read(key: string): PlaygroundValue {
        return this._value()[key];
    }

    public write(key: string, value: PlaygroundValue): void {
        this._value.update((state) => ({ ...state, [key]: value }) as Widen<T>);
    }

    public reset(): void {
        this._value.set({ ...this.initial });
    }
}

/** Formats attributes for generated markup, dropping empty ones. */
export function attrs(...parts: (string | false | null | undefined)[]): string {
    return parts.filter(Boolean).join(' ');
}
