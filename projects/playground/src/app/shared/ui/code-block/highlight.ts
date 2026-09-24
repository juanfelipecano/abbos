import { CodeLang } from '../../../core/docs/doc.model';

export type TokenKind =
    'keyword' | 'string' | 'tag' | 'attr' | 'comment' | 'number' | 'type' | 'punct' | 'plain';

export interface Token {
    readonly text: string;
    readonly kind: TokenKind;
}

const KEYWORDS = new Set(
    'import from export class const let var return new this true false null private readonly protected public constructor type interface extends implements if else async await void of as default with'.split(
        ' ',
    ),
);

// Groups: 1 comment, 2 string, 3 @decorator/@control-flow, 4 tag, 5 css var / sass var,
// 6 attribute name (followed by =), 7 number, 8 identifier (hyphens allowed, for attributes
// and CSS), 9 whitespace, 10 anything else.
const TOKEN_RE =
    /(\/\/.*$|\/\*.*?\*\/|<!--.*?-->)|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`[^`]*`)|(@[\w-]+)|(<\/?[\w-]+|\/?>)|(--[\w-]+|\$[\w-]+)|([[(]*[\w.-]+[\])]*(?==))|(\b\d+(?:\.\d+)?(?:px|ms|rem|em|%)?\b)|([A-Za-z_][\w-]*)|(\s+)|(.)/g;

/**
 * Tiny line tokenizer for the docs' code samples (ts, html, scss, bash). It is deliberately
 * approximate — good enough to colour short snippets without shipping a highlighter.
 */
export function tokenizeLine(line: string, lang: CodeLang): Token[] {
    if (lang === 'bash') {
        return tokenizeBash(line);
    }
    const tokens: Token[] = [];
    const re = new RegExp(TOKEN_RE.source, 'g');
    let match: RegExpExecArray | null;
    while ((match = re.exec(line))) {
        const text = match[0];
        if (!text.length) {
            re.lastIndex++;
            continue;
        }
        tokens.push({ text, kind: kindOf(match, line.slice(re.lastIndex), lang) });
    }
    return tokens.length ? tokens : [{ text: ' ', kind: 'plain' }];
}

export function tokenize(code: string, lang: CodeLang): Token[][] {
    return code
        .replace(/\n$/, '')
        .split('\n')
        .map((line) => tokenizeLine(line, lang));
}

function kindOf(match: RegExpExecArray, rest: string, lang: CodeLang): TokenKind {
    if (match[1]) return 'comment';
    if (match[2]) return 'string';
    if (match[3] || match[5] || match[6]) return 'attr';
    if (match[4]) return 'tag';
    if (match[7]) return 'number';
    if (match[8]) {
        const word = match[8];
        if (KEYWORDS.has(word)) return 'keyword';
        if (/^[A-Z]/.test(word)) return 'type';
        if (lang === 'scss' && /^\s*:/.test(rest)) return 'keyword';
        if (rest.startsWith('(')) return 'type';
        return 'plain';
    }
    if (match[10]) return 'punct';
    return 'plain';
}

function tokenizeBash(line: string): Token[] {
    const match = line.match(/^(\$ )?(\S+)(.*)$/);
    if (!match) {
        return [{ text: line || ' ', kind: 'plain' }];
    }
    const tokens: Token[] = [];
    if (match[1]) tokens.push({ text: match[1], kind: 'comment' });
    tokens.push({ text: match[2], kind: 'keyword' });
    if (match[3]) tokens.push({ text: match[3], kind: 'plain' });
    return tokens;
}
