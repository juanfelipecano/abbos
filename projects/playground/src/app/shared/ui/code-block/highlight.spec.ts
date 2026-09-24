import { tokenize, tokenizeLine } from './highlight';

const kinds = (line: string, lang: Parameters<typeof tokenizeLine>[1]) =>
    tokenizeLine(line, lang)
        .filter((token) => token.text.trim())
        .map((token) => `${token.kind}:${token.text}`);

describe('tokenizeLine', () => {
    it('colours TypeScript keywords, types and strings', () => {
        expect(kinds("import { AbButton } from '@juanfelipecano/abbos';", 'ts')).toEqual([
            'keyword:import',
            'punct:{',
            'type:AbButton',
            'punct:}',
            'keyword:from',
            "string:'@juanfelipecano/abbos'",
            'punct:;',
        ]);
    });

    it('colours HTML tags and attribute names', () => {
        expect(kinds('<button ab-button variant="soft">', 'html')).toEqual([
            'tag:<button',
            'plain:ab-button',
            'attr:variant',
            'punct:=',
            'string:"soft"',
            'tag:>',
        ]);
    });

    it('treats SCSS properties as keywords and custom properties as attributes', () => {
        expect(kinds('  gap: var(--ab-space-3);', 'scss')).toEqual([
            'keyword:gap',
            'punct::',
            'keyword:var',
            'punct:(',
            'attr:--ab-space-3',
            'punct:)',
            'punct:;',
        ]);
    });

    it('dims the bash prompt and highlights the command', () => {
        expect(tokenizeLine('$ npm install @juanfelipecano/abbos', 'bash')).toEqual([
            { text: '$ ', kind: 'comment' },
            { text: 'npm', kind: 'keyword' },
            { text: ' install @juanfelipecano/abbos', kind: 'plain' },
        ]);
    });

    it('keeps comments whole', () => {
        expect(kinds('// …persist', 'ts')).toEqual(['comment:// …persist']);
    });

    it('renders an empty line as a single space so it keeps its height', () => {
        expect(tokenizeLine('', 'ts')).toEqual([{ text: ' ', kind: 'plain' }]);
    });
});

describe('tokenize', () => {
    it('splits lines and ignores one trailing newline', () => {
        expect(tokenize('a\nb\n', 'ts')).toHaveLength(2);
    });
});
