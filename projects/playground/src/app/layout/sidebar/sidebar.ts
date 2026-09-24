import { Component, output, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideChevronDown } from '@lucide/angular';
import { navGroups } from '../../core/docs/docs-registry';
import { StatusBadge } from '../../shared/ui/status-badge/status-badge';

/** Documentation navigation, built from the registry. Used in the desktop aside and the drawer. */
@Component({
    selector: 'app-sidebar',
    imports: [RouterLink, RouterLinkActive, StatusBadge, LucideChevronDown],
    templateUrl: './sidebar.html',
    styleUrl: './sidebar.scss',
})
export class Sidebar {
    /** Emits when a link is followed, so the drawer can close. */
    public readonly navigate = output<void>();

    protected readonly groups = navGroups();
    protected readonly collapsed = signal<ReadonlySet<string>>(new Set());

    protected toggle(label: string): void {
        this.collapsed.update((set) => {
            const next = new Set(set);
            if (!next.delete(label)) {
                next.add(label);
            }
            return next;
        });
    }

    protected groupId(label: string): string {
        return `nav-${label.toLowerCase()}`;
    }
}
