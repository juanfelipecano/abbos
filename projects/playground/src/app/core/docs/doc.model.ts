import { Type } from '@angular/core';
import { Route } from '@angular/router';

export type DocCategoryId = 'components' | 'directives' | 'pipes';
export type DocKind = 'Component' | 'Directive' | 'Pipe';
export type DocStatus = 'New' | 'Beta' | 'Coming soon' | 'Sample';

/**
 * Lightweight metadata for one documented item. Everything app-wide (routes, sidebar, search,
 * category grid, prev/next) is derived from these, so an entry is the only place an item is listed.
 * Heavy content (API tables, examples) lives in the lazily loaded page instead.
 */
export interface DocEntry {
    readonly slug: string;
    readonly category: DocCategoryId;
    readonly kind: DocKind;
    readonly title: string;
    readonly description: string;
    readonly status: DocStatus;
    /** Filter chips on the category page, e.g. 'Actions', 'Form'. */
    readonly tags: readonly string[];
    /** Selector as a consumer writes it, e.g. `button[ab-button]`. */
    readonly selector: string;
    /** Symbols a consumer imports from the package. */
    readonly importNames: readonly string[];
    /** Path of the source folder inside the repo, for "View source". */
    readonly sourcePath?: string;
    /** Sample pages document an item that doesn't exist yet. */
    readonly sample?: boolean;
    /** Small live preview for the category grid. */
    readonly thumbnail?: Type<unknown>;
    readonly loadPage: NonNullable<Route['loadComponent']>;
}

export interface DocCategory {
    readonly id: DocCategoryId;
    readonly title: string;
    readonly description: string;
    readonly emptyTitle: string;
    readonly emptyText: string;
}

/** One row of an Inputs table. */
export interface ApiInput {
    readonly name: string;
    readonly type: string;
    readonly default: string;
    readonly description: string;
}

/** One row of an Outputs table. */
export interface ApiOutput {
    readonly name: string;
    readonly payload: string;
    readonly description: string;
}

/** One content-projection slot, e.g. `[abStart]`. */
export interface ApiSlot {
    readonly selector: string;
    readonly description: string;
}

/** One CSS custom property a consumer can override. */
export interface ApiCssVar {
    readonly name: string;
    readonly default: string;
    readonly description: string;
}

/** API reference for one class; a page may document several (e.g. list + item). */
export interface ApiReference {
    /** Class name; shown as a heading only when a page has more than one reference. */
    readonly name: string;
    readonly inputs: readonly ApiInput[];
    readonly outputs?: readonly ApiOutput[];
    readonly slots?: readonly ApiSlot[];
    readonly cssVars?: readonly ApiCssVar[];
}

export interface KeyboardRow {
    readonly keys: readonly string[];
    readonly action: string;
}

export type CodeLang = 'ts' | 'html' | 'scss' | 'bash';

export interface CodeFile {
    /** Tab label, e.g. 'HTML'. */
    readonly label: string;
    /** File name shown next to the tabs. */
    readonly name?: string;
    readonly lang: CodeLang;
    readonly code: string;
}

export interface ExampleDef {
    readonly id: string;
    readonly title: string;
    readonly description: string;
    readonly component: Type<unknown>;
    readonly files: readonly CodeFile[];
    /** Open on the Code tab instead of Preview. */
    readonly showCode?: boolean;
}

export interface BestPractice {
    readonly ok: boolean;
    readonly text: string;
    readonly component: Type<unknown>;
}

/** Full content of a component page, rendered top to bottom by `DocPage`. */
export interface ComponentDoc {
    readonly slug: string;
    readonly examples: readonly ExampleDef[];
    readonly api: readonly ApiReference[];
    readonly keyboard: readonly KeyboardRow[];
    readonly aria: readonly string[];
    readonly bestPractices: readonly BestPractice[];
    readonly related: readonly string[];
}
