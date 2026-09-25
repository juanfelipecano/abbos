import { Component, computed } from '@angular/core';
import { AbSkeleton } from 'abbos';
import { PlaygroundFrame } from '../../../shared/ui/playground-frame/playground-frame';
import { attrs, PlaygroundState } from '../../../shared/ui/playground-frame/playground-state';

@Component({
    selector: 'app-skeleton-playground',
    imports: [PlaygroundFrame, AbSkeleton],
    template: `
        <app-playground-frame [model]="state" [code]="code()" fileName="skeleton-playground.html">
            @let s = state.value();
            <ab-skeleton
                [variant]="$any(s.variant)"
                [animation]="$any(s.animation)"
                [lines]="s.lines"
                [width]="s.width || undefined"
                [height]="s.height || undefined"
            />
        </app-playground-frame>
    `,
})
export class SkeletonPlayground {
    protected readonly state = new PlaygroundState(
        { variant: 'text', animation: 'pulse', lines: '3', width: '', height: '' },
        [
            {
                kind: 'select',
                key: 'variant',
                label: 'Variant',
                options: ['rect', 'text', 'circle'],
            },
            {
                kind: 'select',
                key: 'animation',
                label: 'Animation',
                options: ['pulse', 'shimmer', 'none'],
            },
            { kind: 'text', key: 'lines', label: 'Lines (text)' },
            { kind: 'text', key: 'width', label: 'Width' },
            { kind: 'text', key: 'height', label: 'Height' },
        ],
    );

    protected readonly code = computed(() => {
        const s = this.state.value();
        return `<${attrs(
            'ab-skeleton',
            s.variant !== 'rect' && `variant="${s.variant}"`,
            s.variant === 'text' && s.lines !== '1' && `lines="${s.lines}"`,
            s.width && `width="${s.width}"`,
            s.height && `height="${s.height}"`,
            s.animation !== 'pulse' && `animation="${s.animation}"`,
        )} />`;
    });
}
