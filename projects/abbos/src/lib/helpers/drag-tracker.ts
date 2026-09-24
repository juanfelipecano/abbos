const DRAG_THRESHOLD_PX = 4;
const FLICK_VELOCITY_PX_PER_MS = 0.5;

interface Gesture {
    startX: number;
    startOffset: number;
    travel: number;
    offset: number;
    velocity: number;
    lastX: number;
    lastTime: number;
    active: boolean;
}

export interface AbDragEnd {
    offset: number;
    /** Whether the drag resolves to the "end" position (release past the midpoint, or a flick toward it). */
    towardEnd: boolean;
}

/**
 * Framework-free pointer-drag maths shared by the two-state controls (switch, segmented toggle):
 * threshold, clamped offset, flick velocity, and swallowing the click that trails a drag.
 * Components own the DOM side (pointer capture, rendering the offset).
 */
export class AbDragTracker {
    private _gesture: Gesture | null = null;
    private _clickSuppressed = false;

    /** True once the pointer has moved past the drag threshold. */
    public get dragging(): boolean {
        return this._gesture?.active ?? false;
    }

    /** True for the tick right after a drag, so the trailing click can be ignored. */
    public get clickSuppressed(): boolean {
        return this._clickSuppressed;
    }

    /** `startOffset` is where the thumb rests now (0 or `travel`); `travel` is its full range in px. */
    public start(event: PointerEvent, startOffset: number, travel: number): void {
        this._gesture = {
            startX: event.clientX,
            startOffset,
            travel,
            offset: startOffset,
            velocity: 0,
            lastX: event.clientX,
            lastTime: event.timeStamp,
            active: false,
        };
    }

    /** Returns the new clamped offset while dragging, or `null` if not (yet) a drag. */
    public move(event: PointerEvent): number | null {
        const gesture = this._gesture;
        if (!gesture) {
            return null;
        }
        const dx = event.clientX - gesture.startX;
        if (!gesture.active && Math.abs(dx) < DRAG_THRESHOLD_PX) {
            return null;
        }
        gesture.active = true;

        const elapsed = event.timeStamp - gesture.lastTime;
        if (elapsed > 0) {
            gesture.velocity = (event.clientX - gesture.lastX) / elapsed;
        }
        gesture.lastX = event.clientX;
        gesture.lastTime = event.timeStamp;
        gesture.offset = Math.min(Math.max(gesture.startOffset + dx, 0), gesture.travel);
        return gesture.offset;
    }

    /** Finishes the gesture; `null` when it was only a tap (let `click` handle it). */
    public end(): AbDragEnd | null {
        const gesture = this._gesture;
        this._gesture = null;
        if (!gesture?.active) {
            return null;
        }
        this.suppressNextClick();
        const flick = Math.abs(gesture.velocity) > FLICK_VELOCITY_PX_PER_MS;
        return {
            offset: gesture.offset,
            towardEnd: flick ? gesture.velocity > 0 : gesture.offset > gesture.travel / 2,
        };
    }

    /** Aborts the gesture without a result; returns whether a drag was in progress. */
    public cancel(): boolean {
        const wasDragging = this.dragging;
        this._gesture = null;
        if (wasDragging) {
            this.suppressNextClick();
        }
        return wasDragging;
    }

    private suppressNextClick(): void {
        this._clickSuppressed = true;
        setTimeout(() => (this._clickSuppressed = false));
    }
}
