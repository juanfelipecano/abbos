import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { AbSegment, AbSegmentContent, AbSegments } from 'abbos';
import { ExampleDef } from '../../../../core/docs/doc.model';
import { exampleFiles } from '../../../../shared/docs/example-files';
import basic from './segments-basic.html' with { loader: 'text' };
import content from './segments-content.html' with { loader: 'text' };
import forms from './segments-forms.html' with { loader: 'text' };
import router from './segments-router.html' with { loader: 'text' };
import sizes from './segments-sizes.html' with { loader: 'text' };

const STATUS_STYLES = `
    .status {
        font: var(--ab-text-caption);
        color: var(--ab-text-secondary);
    }
`;

@Component({
    selector: 'app-segments-basic',
    imports: [AbSegments, AbSegment],
    templateUrl: './segments-basic.html',
    styles: STATUS_STYLES,
    host: { class: 'pg-row' },
})
export class SegmentsBasic {
    protected readonly type = signal('expense');
}

@Component({
    selector: 'app-segments-content',
    imports: [AbSegments, AbSegment, AbSegmentContent],
    templateUrl: './segments-content.html',
    host: { class: 'pg-stack' },
})
export class SegmentsContent {
    protected readonly type = signal('expense');
}

@Component({
    selector: 'app-segments-router',
    imports: [AbSegments, AbSegment],
    templateUrl: './segments-router.html',
    styles: STATUS_STYLES,
    host: { class: 'pg-row' },
})
export class SegmentsRouter {
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly params = toSignal(this.route.queryParamMap.pipe(map((p) => p.get('type'))));

    protected readonly type = computed(() => this.params() ?? 'expense');

    protected select(type: string | null): void {
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { type },
            queryParamsHandling: 'merge',
            replaceUrl: true,
        });
    }
}

@Component({
    selector: 'app-segments-forms',
    imports: [AbSegments, AbSegment, ReactiveFormsModule],
    templateUrl: './segments-forms.html',
    styles: STATUS_STYLES,
    host: { class: 'pg-row' },
})
export class SegmentsForms {
    protected readonly period = new FormControl('week', { nonNullable: true });
}

@Component({
    selector: 'app-segments-sizes',
    imports: [AbSegments, AbSegment],
    templateUrl: './segments-sizes.html',
    host: { class: 'pg-row' },
})
export class SegmentsSizes {}

export const SEGMENTS_EXAMPLES: readonly ExampleDef[] = [
    {
        id: 'basic',
        title: 'Basic',
        description: 'Any number of segments. value holds the selected segment’s value.',
        component: SegmentsBasic,
        files: exampleFiles({
            name: 'segments-basic',
            html: basic,
            imports: ['AbSegments', 'AbSegment'],
            core: ['signal'],
            body: "  type = signal('expense');",
        }),
    },
    {
        id: 'content',
        title: 'Switching content',
        description:
            'Put an abSegmentContent template inside a segment and it renders below the control while that segment is active.',
        component: SegmentsContent,
        showCode: true,
        files: exampleFiles({
            name: 'segments-content',
            html: content,
            imports: ['AbSegments', 'AbSegment', 'AbSegmentContent'],
            core: ['signal'],
            body: "  type = signal('expense');",
            layout: 'stack',
        }),
    },
    {
        id: 'router',
        title: 'Bound to the router',
        description:
            'The component doesn’t know about the router. Read a query param into value and navigate from valueChange to keep the URL in sync, so links and the back button work.',
        component: SegmentsRouter,
        showCode: true,
        files: exampleFiles({
            name: 'segments-router',
            html: router,
            imports: ['AbSegments', 'AbSegment'],
            core: ['computed', 'inject'],
            extraImports: [
                "import { toSignal } from '@angular/core/rxjs-interop';",
                "import { ActivatedRoute, Router } from '@angular/router';",
                "import { map } from 'rxjs';",
            ],
            body: [
                '  private router = inject(Router);',
                '  private route = inject(ActivatedRoute);',
                "  private params = toSignal(this.route.queryParamMap.pipe(map((p) => p.get('type'))));",
                '',
                "  type = computed(() => this.params() ?? 'expense');",
                '',
                '  select(type: string | null) {',
                '    this.router.navigate([], {',
                '      relativeTo: this.route,',
                '      queryParams: { type },',
                "      queryParamsHandling: 'merge',",
                '      replaceUrl: true,',
                '    });',
                '  }',
            ].join('\n'),
        }),
    },
    {
        id: 'forms',
        title: 'In a form',
        description: 'Implements ControlValueAccessor, so it binds to reactive and template forms.',
        component: SegmentsForms,
        files: exampleFiles({
            name: 'segments-forms',
            html: forms,
            imports: ['AbSegments', 'AbSegment'],
            extraImports: ["import { FormControl, ReactiveFormsModule } from '@angular/forms';"],
            extraDeps: ['ReactiveFormsModule'],
            body: "  period = new FormControl('week', { nonNullable: true });",
        }),
    },
    {
        id: 'sizes',
        title: 'Sizes',
        description: 'Matches the 32, 40 and 48px control heights.',
        component: SegmentsSizes,
        files: exampleFiles({
            name: 'segments-sizes',
            html: sizes,
            imports: ['AbSegments', 'AbSegment'],
        }),
    },
];
