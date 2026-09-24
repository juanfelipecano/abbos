import { DestroyRef, DOCUMENT, inject, Service, signal } from '@angular/core';

/** Below this width the shell switches to the drawer + stacked layout. */
const MOBILE_QUERY = '(max-width: 959px)';

@Service()
export class Viewport {
    private readonly query = inject(DOCUMENT).defaultView?.matchMedia?.(MOBILE_QUERY);

    public readonly isMobile = signal(this.query?.matches ?? false);

    constructor() {
        const query = this.query;
        if (!query) {
            return;
        }
        const update = (event: MediaQueryListEvent) => this.isMobile.set(event.matches);
        query.addEventListener('change', update);
        inject(DestroyRef).onDestroy(() => query.removeEventListener('change', update));
    }
}
