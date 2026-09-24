/**
 * Roving-focus arrow handling for `role="tablist"` (WAI-ARIA tabs pattern, automatic activation).
 * Returns the index to select, or `null` when the key isn't a tab-navigation key.
 */
export function nextTabIndex(event: KeyboardEvent, current: number, count: number): number | null {
    const next: Record<string, number> = {
        ArrowRight: (current + 1) % count,
        ArrowDown: (current + 1) % count,
        ArrowLeft: (current - 1 + count) % count,
        ArrowUp: (current - 1 + count) % count,
        Home: 0,
        End: count - 1,
    };
    const index = next[event.key];
    if (index === undefined) {
        return null;
    }
    event.preventDefault();
    const tabs = (event.currentTarget as HTMLElement | null)?.querySelectorAll<HTMLElement>(
        '[role="tab"]',
    );
    tabs?.[index]?.focus();
    return index;
}
