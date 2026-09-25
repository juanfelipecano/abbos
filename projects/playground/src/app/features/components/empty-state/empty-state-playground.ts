import { Component, computed } from '@angular/core';
import { LucideFolderPlus } from '@lucide/angular';
import { AbButton, AbEmptyState, AbIcon } from 'abbos';
import { PlaygroundFrame } from '../../../shared/ui/playground-frame/playground-frame';
import { attrs, PlaygroundState } from '../../../shared/ui/playground-frame/playground-state';

@Component({
    selector: 'app-empty-state-playground',
    imports: [PlaygroundFrame, AbEmptyState, AbButton, AbIcon],
    template: `
        <app-playground-frame
            [model]="state"
            [code]="code()"
            fileName="empty-state-playground.html"
        >
            @let s = state.value();
            <ab-empty-state [title]="s.title" [description]="s.description" [size]="$any(s.size)">
                <ab-icon
                    abMedia
                    [icon]="folderPlus"
                    [tone]="$any(s.tone)"
                    appearance="soft"
                    size="lg"
                />
                @if (s.actions) {
                    <button ab-button abActions>New project</button>
                }
                @if (s.actions) {
                    <button ab-button abActions variant="ghost">Import projects</button>
                }
            </ab-empty-state>
        </app-playground-frame>
    `,
})
export class EmptyStatePlayground {
    protected readonly folderPlus = LucideFolderPlus;

    protected readonly state = new PlaygroundState(
        {
            title: 'Create your first project',
            description: 'Projects keep your files, tasks and people in one place.',
            tone: 'primary',
            size: 'md',
            actions: true,
        },
        [
            { kind: 'text', key: 'title', label: 'Title' },
            { kind: 'text', key: 'description', label: 'Description' },
            {
                kind: 'select',
                key: 'tone',
                label: 'Tone',
                options: ['primary', 'neutral', 'success', 'info', 'warning', 'danger'],
            },
            { kind: 'select', key: 'size', label: 'Size', options: ['md', 'sm'] },
            { kind: 'toggle', key: 'actions', label: 'Actions' },
        ],
    );

    protected readonly code = computed(() => {
        const s = this.state.value();
        const list = attrs(
            'ab-empty-state',
            `title="${s.title}"`,
            s.description && `description="${s.description}"`,
            s.size !== 'md' && `size="${s.size}"`,
        );
        return [
            `<${list}>`,
            `  <ab-icon abMedia [icon]="folderPlus" tone="${s.tone}" appearance="soft" size="lg" />`,
            ...(s.actions
                ? [
                      '  <button ab-button abActions>New project</button>',
                      '  <button ab-button abActions variant="ghost">Import projects</button>',
                  ]
                : []),
            '</ab-empty-state>',
        ].join('\n');
    });
}
