import { Component, inject, input, signal } from '@angular/core';
import {
    AbBottomSheet,
    AbBottomSheetController,
    AbBottomSheetRef,
    AbButton,
    AbInput,
    AbSheetFooter,
} from 'abbos';
import { firstValueFrom } from 'rxjs';
import { ExampleDef } from '../../../../core/docs/doc.model';
import { exampleFiles } from '../../../../shared/docs/example-files';
import actions from './bottom-sheet-actions.html' with { loader: 'text' };
import controller from './bottom-sheet-controller.html' with { loader: 'text' };
import form from './bottom-sheet-form.html' with { loader: 'text' };
import standard from './bottom-sheet-standard.html' with { loader: 'text' };

@Component({
    selector: 'app-bottom-sheet-actions',
    imports: [AbBottomSheet, AbButton],
    templateUrl: './bottom-sheet-actions.html',
    styles: `
        .actions {
            display: grid;
        }
    `,
})
export class BottomSheetActions {
    protected readonly open = signal(false);
}

@Component({
    selector: 'app-bottom-sheet-form',
    imports: [AbBottomSheet, AbSheetFooter, AbButton, AbInput],
    templateUrl: './bottom-sheet-form.html',
    styles: `
        .footer {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
        }
    `,
})
export class BottomSheetForm {
    protected readonly open = signal(false);
}

@Component({
    selector: 'app-bottom-sheet-standard',
    imports: [AbBottomSheet],
    templateUrl: './bottom-sheet-standard.html',
    styles: `
        .stage {
            --ab-bottom-sheet-position: absolute;
            position: relative;
            overflow: hidden;
            height: 360px;
            border: 1px solid var(--ab-border);
            border-radius: var(--ab-radius-lg);
            padding: 16px;
        }
    `,
})
export class BottomSheetStandard {
    protected readonly open = signal(false);
}

@Component({
    selector: 'app-colour-sheet',
    imports: [AbButton],
    template: `
        <div class="options">
            @for (colour of colours; track colour) {
                <button
                    ab-button
                    [variant]="colour === current() ? 'soft' : 'ghost'"
                    (click)="ref.close(colour)"
                >
                    {{ colour }}
                </button>
            }
        </div>
    `,
    styles: `
        .options {
            display: grid;
        }
    `,
})
export class ColourSheet {
    protected readonly ref = inject<AbBottomSheetRef<string>>(AbBottomSheetRef);
    protected readonly colours = ['Emerald', 'Indigo', 'Amber'];
    public readonly current = input('Emerald');
}

@Component({
    selector: 'app-bottom-sheet-controller',
    imports: [AbButton],
    templateUrl: './bottom-sheet-controller.html',
})
export class BottomSheetControllerExample {
    private readonly sheets = inject(AbBottomSheetController);
    protected readonly result = signal<string | undefined>(undefined);

    protected async pick(): Promise<void> {
        const ref = this.sheets.open<ColourSheet, string>(ColourSheet, {
            heading: 'Pick a colour',
            compact: true,
            inputs: { current: this.result() ?? 'Emerald' },
        });
        const colour = await firstValueFrom(ref.afterClosed());
        // undefined means the sheet was dismissed, so keep the previous choice
        if (colour) {
            this.result.set(colour);
        }
    }
}

export const BOTTOM_SHEET_EXAMPLES: readonly ExampleDef[] = [
    {
        id: 'modal-actions',
        title: 'Modal action list',
        description:
            'A modal sheet over a scrim. Esc, the scrim, the close button and dragging down all dismiss it. Focus is trapped and returns to the trigger.',
        component: BottomSheetActions,
        files: exampleFiles({
            name: 'bottom-sheet-actions',
            html: actions,
            imports: ['AbBottomSheet', 'AbButton'],
            core: ['signal'],
            body: '  open = signal(false);',
        }),
    },
    {
        id: 'modal-form',
        title: 'Form with pinned footer',
        description:
            'Project the actions with abSheetFooter. The body scrolls once the sheet reaches the viewport minus 56px, and the footer stays in place.',
        component: BottomSheetForm,
        files: exampleFiles({
            name: 'bottom-sheet-form',
            html: form,
            imports: ['AbBottomSheet', 'AbSheetFooter', 'AbButton', 'AbInput'],
            core: ['signal'],
            body: '  open = signal(false);',
        }),
    },
    {
        id: 'standard',
        title: 'Standard',
        description:
            'No scrim and no focus trap. The sheet collapses to a peek instead of closing, and open means expanded. Positioned inside a frame here with --ab-bottom-sheet-position.',
        component: BottomSheetStandard,
        files: exampleFiles({
            name: 'bottom-sheet-standard',
            html: standard,
            imports: ['AbBottomSheet'],
            core: ['signal'],
            layout: 'stack',
            body: '  open = signal(false);',
        }),
    },
    {
        id: 'controller',
        title: 'Controller',
        description:
            'Open any component from code with AbBottomSheetController. Pass its input()s with inputs, close with a result through the injected AbBottomSheetRef, and read it from afterClosed. Dismissing resolves undefined.',
        component: BottomSheetControllerExample,
        showCode: true,
        files: [
            ...exampleFiles({
                name: 'bottom-sheet-controller',
                html: controller,
                imports: ['AbBottomSheetController', 'AbButton'],
                core: ['inject', 'signal'],
                extraImports: ["import { firstValueFrom } from 'rxjs';"],
                body: "  private sheets = inject(AbBottomSheetController);\n  result = signal<string | undefined>(undefined);\n\n  async pick() {\n    const ref = this.sheets.open<ColourSheet, string>(ColourSheet, {\n      heading: 'Pick a colour',\n      compact: true,\n      inputs: { current: this.result() ?? 'Emerald' },\n    });\n    const colour = await firstValueFrom(ref.afterClosed());\n    // undefined means the sheet was dismissed, so keep the previous choice\n    if (colour) {\n      this.result.set(colour);\n    }\n  }",
            }).slice(0, 2),
            {
                label: 'Sheet',
                name: 'colour-sheet.ts',
                lang: 'ts',
                code: `import { Component, inject, input } from '@angular/core';
import { AbBottomSheetRef, AbButton } from '@juanfelipecano/abbos';

@Component({
  selector: 'app-colour-sheet',
  imports: [AbButton],
  template: \`
    @for (colour of colours; track colour) {
      <button ab-button variant="ghost" (click)="ref.close(colour)">{{ colour }}</button>
    }
  \`,
})
export class ColourSheet {
  ref = inject<AbBottomSheetRef<string>>(AbBottomSheetRef);
  colours = ['Emerald', 'Indigo', 'Amber'];
  current = input('Emerald');
}`,
            },
        ],
    },
];
