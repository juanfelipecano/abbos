const DRAG_THRESHOLD_PX = 4;

interface Gesture {
    startY: number;
    lastY: number;
    lastTime: number;
    /** Signed drag distance in px (positive = downward). */
    delta: number;
    /** Signed velocity in px/ms (positive = downward). */
    velocity: number;
    active: boolean;
}

export interface AbVerticalDragEnd {
    delta: number;
    velocity: number;
}

/**
 * Framework-free vertical pointer-drag maths for sheets: tap threshold, signed distance,
 * velocity, and swallowing the click that trails a drag. Components own pointer capture,
 * damping and thresholds, since those differ per sheet mode.
 */
export class AbVerticalDragTracker {
    private _gesture: Gesture | null = null;
    private _clickSuppressed = false;

    public get dragging(): boolean {
        return this._gesture?.active ?? false;
    }

    /** True for the tick right after a drag, so the trailing click can be ignored. */
    public get clickSuppressed(): boolean {
        return this._clickSuppressed;
    }

    public start(event: PointerEvent): void {
        this._gesture = {
            startY: event.clientY,
            lastY: event.clientY,
            lastTime: event.timeStamp,
            delta: 0,
            velocity: 0,
            active: false,
        };
    }

    /** Returns the signed distance while dragging, or `null` if not (yet) a drag. */
    public move(event: PointerEvent): number | null {
        const gesture = this._gesture;
        if (!gesture) {
            return null;
        }
        const delta = event.clientY - gesture.startY;
        if (!gesture.active && Math.abs(delta) < DRAG_THRESHOLD_PX) {
            return null;
        }
        gesture.active = true;
        const elapsed = event.timeStamp - gesture.lastTime;
        if (elapsed > 0) {
            gesture.velocity = (event.clientY - gesture.lastY) / elapsed;
        }
        gesture.lastY = event.clientY;
        gesture.lastTime = event.timeStamp;
        gesture.delta = delta;
        return delta;
    }

    /** Finishes the gesture; `null` when it was only a tap. */
    public end(): AbVerticalDragEnd | null {
        const gesture = this._gesture;
        this._gesture = null;
        if (!gesture?.active) {
            return null;
        }
        this.suppressNextClick();
        return { delta: gesture.delta, velocity: gesture.velocity };
    }

    public cancel(): void {
        if (this.dragging) {
            this.suppressNextClick();
        }
        this._gesture = null;
    }

    private suppressNextClick(): void {
        this._clickSuppressed = true;
        setTimeout(() => (this._clickSuppressed = false));
    }
}
