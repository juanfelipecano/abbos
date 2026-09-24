import { CodeFile } from '../../core/docs/doc.model';
import { PACKAGE_NAME } from '../../core/docs/site';

export type ExampleLayout = 'row' | 'stack';

/** Host layouts the example components use (`host: { class: 'pg-row' }`), shown as SCSS. */
const LAYOUT_SCSS: Record<ExampleLayout, string> = {
    row: ':host {\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  gap: 12px;\n}',
    stack: ':host {\n  display: grid;\n  gap: 16px;\n  max-width: 320px;\n}',
};

export interface ExampleSource {
    /** Kebab-case name: `button-variants` → selector `app-button-variants`, class `ButtonVariants`. */
    readonly name: string;
    /** The example's real template, imported with `{ loader: 'text' }`. */
    readonly html: string;
    /** Symbols imported from the library. */
    readonly imports: readonly string[];
    /** Extra `@angular/core` symbols, e.g. `['signal']`. */
    readonly core?: readonly string[];
    /** Other import lines, verbatim. */
    readonly extraImports?: readonly string[];
    /** Extra entries for the component's `imports` array. */
    readonly extraDeps?: readonly string[];
    /** `providers` array contents, verbatim. */
    readonly providers?: string;
    /** Class body, verbatim (already indented). */
    readonly body?: string;
    readonly layout?: ExampleLayout;
}

/** Builds the HTML / TS / SCSS tabs shown under an example's Code view. */
export function exampleFiles(source: ExampleSource): CodeFile[] {
    const layout = source.layout ?? 'row';
    return [
        { label: 'HTML', name: `${source.name}.html`, lang: 'html', code: source.html },
        { label: 'TS', name: `${source.name}.ts`, lang: 'ts', code: exampleTs(source) },
        { label: 'SCSS', name: `${source.name}.scss`, lang: 'scss', code: LAYOUT_SCSS[layout] },
    ];
}

export function exampleTs(source: ExampleSource): string {
    const core = ['Component', ...(source.core ?? [])].join(', ');
    const className = source.name
        .split('-')
        .map((part) => part[0].toUpperCase() + part.slice(1))
        .join('');
    const lines = [
        `import { ${core} } from '@angular/core';`,
        ...(source.extraImports ?? []),
        `import { ${source.imports.join(', ')} } from '${PACKAGE_NAME}';`,
        '',
        '@Component({',
        `  selector: 'app-${source.name}',`,
        `  imports: [${[...source.imports, ...(source.extraDeps ?? [])].join(', ')}],`,
        `  templateUrl: './${source.name}.html',`,
        `  styleUrl: './${source.name}.scss',`,
        ...(source.providers ? [`  providers: [${source.providers}],`] : []),
        '})',
        `export class ${className} {${source.body ? `\n${source.body}\n` : ''}}`,
    ];
    return lines.join('\n');
}
