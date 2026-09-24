import { DocEntry } from '../../core/docs/doc.model';

export interface FilterChip {
    readonly label: string;
    readonly count: number;
}

/** 'All', then every tag, then every status — each with how many entries it matches. */
export function filterChips(entries: readonly DocEntry[]): FilterChip[] {
    const labels = [
        ...new Set(entries.flatMap((entry) => entry.tags)),
        ...new Set(entries.map((entry) => entry.status)),
    ];
    return [
        { label: 'All', count: entries.length },
        ...labels.map((label) => ({
            label,
            count: entries.filter((entry) => matchesChip(entry, label)).length,
        })),
    ];
}

export function filterEntries(
    entries: readonly DocEntry[],
    chip: string,
    query: string,
): DocEntry[] {
    const needle = query.trim().toLowerCase();
    return entries.filter(
        (entry) =>
            matchesChip(entry, chip) &&
            (!needle || `${entry.title} ${entry.description}`.toLowerCase().includes(needle)),
    );
}

function matchesChip(entry: DocEntry, chip: string): boolean {
    return chip === 'All' || entry.tags.includes(chip) || entry.status === chip;
}
