/**
 * Sample implementation behind the "Try it" panel. Not part of the library yet.
 * Kept as a plain function so templates (through a pipe) and TypeScript share one implementation.
 */
export function truncate(value: string | null | undefined, length = 20, suffix = '…'): string {
    const text = value ?? '';
    const max = Math.max(0, Math.floor(length) || 0);
    return text.length <= max ? text : text.slice(0, max).trimEnd() + suffix;
}
