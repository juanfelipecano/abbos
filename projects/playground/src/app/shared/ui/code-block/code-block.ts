import {
    booleanAttribute,
    Component,
    computed,
    DestroyRef,
    inject,
    input,
    signal,
} from '@angular/core';
import { LucideCheck, LucideCopy } from '@lucide/angular';
import { CodeFile, CodeLang } from '../../../core/docs/doc.model';
import { nextTabIndex } from '../tabs/tab-keys';
import { tokenize } from './highlight';

const COPIED_MS = 1600;

let nextId = 0;

/**
 * Dark code panel. Pass `files` for a tabbed multi-file view, or `code` + `lang` for one file.
 * `inline` renders a single-line command strip with a compact copy button.
 */
@Component({
    selector: 'app-code-block',
    imports: [LucideCopy, LucideCheck],
    templateUrl: './code-block.html',
    styleUrl: './code-block.scss',
    host: { '[class.inline]': 'inline()' },
})
export class CodeBlock {
    public readonly files = input<readonly CodeFile[]>([]);
    public readonly code = input('');
    public readonly lang = input<CodeLang>('ts');
    public readonly fileName = input<string>();
    public readonly inline = input(false, { transform: booleanAttribute });
    public readonly lineNumbers = input(true, { transform: booleanAttribute });

    protected readonly uid = `code-${nextId++}`;
    protected readonly tab = signal(0);
    protected readonly copied = signal(false);
    private timer: ReturnType<typeof setTimeout> | undefined;

    protected readonly allFiles = computed<readonly CodeFile[]>(() => {
        const files = this.files();
        if (files.length) {
            return files;
        }
        const name = this.fileName();
        return [{ label: name ?? this.lang(), name, lang: this.lang(), code: this.code() }];
    });

    protected readonly current = computed(() => {
        const files = this.allFiles();
        return files[Math.min(this.tab(), files.length - 1)];
    });

    protected readonly lines = computed(() => tokenize(this.current().code, this.current().lang));
    protected readonly showNumbers = computed(
        () => !this.inline() && this.lineNumbers() && this.lines().length > 2,
    );

    constructor() {
        inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
    }

    protected select(index: number): void {
        this.tab.set(index);
    }

    protected onTabKeydown(event: KeyboardEvent): void {
        const index = nextTabIndex(event, this.tab(), this.allFiles().length);
        if (index !== null) {
            this.tab.set(index);
        }
    }

    protected async copy(): Promise<void> {
        const text = this.current().code.replace(/\n$/, '').replace(/^\$ /gm, '');
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            // Clipboard blocked (permissions, insecure context): still confirm so the UI doesn't stall.
        }
        this.copied.set(true);
        clearTimeout(this.timer);
        this.timer = setTimeout(() => this.copied.set(false), COPIED_MS);
    }
}
