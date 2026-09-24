import { ComponentDoc } from '../../../core/docs/doc.model';
import { BOTTOM_SHEET_EXAMPLES } from './examples/bottom-sheet-examples';

export const BOTTOM_SHEET_DOC: ComponentDoc = {
    slug: 'bottom-sheet',
    examples: BOTTOM_SHEET_EXAMPLES,
    api: [
        {
            name: 'AbBottomSheet',
            inputs: [
                {
                    name: 'open',
                    type: 'boolean',
                    default: 'false',
                    description:
                        'Two-way bindable with [(open)]. Modal: the sheet is shown. Standard: the sheet is expanded, otherwise it rests at the peek.',
                },
                {
                    name: 'mode',
                    type: "'modal' | 'standard'",
                    default: "'modal'",
                    description:
                        'Modal renders in a CDK overlay above a scrim and traps focus. Standard stays in the page, has no scrim and keeps the page interactive.',
                },
                {
                    name: 'heading',
                    type: 'string',
                    default: 'required',
                    description:
                        'Title in the header. It is also the accessible name of the sheet.',
                },
                {
                    name: 'subheading',
                    type: 'string',
                    default: 'none',
                    description: 'Secondary line under the heading.',
                },
                {
                    name: 'showHandle',
                    type: 'boolean',
                    default: 'true',
                    description: 'Shows the 32×4 drag handle. When hidden, a small spacer remains.',
                },
                {
                    name: 'peekHeight',
                    type: 'number',
                    default: '92',
                    description: 'Standard only: visible height in px while collapsed.',
                },
                {
                    name: 'dismissible',
                    type: 'boolean',
                    default: 'true',
                    description:
                        'Modal only. When false, Esc, the scrim, dragging and the close button are disabled, so close it by setting open to false.',
                },
                {
                    name: 'compact',
                    type: 'boolean',
                    default: 'false',
                    description:
                        'Uses 8px instead of 24px horizontal body padding, for lists of full-width rows.',
                },
                {
                    name: 'closeLabel',
                    type: 'string',
                    default: "'Close'",
                    description: 'Accessible name of the modal close button. Localise it.',
                },
                {
                    name: 'expandLabel / collapseLabel',
                    type: 'string',
                    default: "'Expand' / 'Collapse'",
                    description: 'Accessible names of the standard-mode header button.',
                },
            ],
            slots: [
                {
                    selector: 'default',
                    description: 'The body. It scrolls when the sheet is tall.',
                },
                {
                    selector: '[abSheetFooter]',
                    description:
                        'Pinned below the body with a top border. Omit it and no footer is rendered.',
                },
            ],
            cssVars: [
                {
                    name: '--ab-bottom-sheet-position',
                    default: 'fixed',
                    description:
                        'Standard mode: use absolute to anchor the sheet to the nearest positioned ancestor.',
                },
                {
                    name: '--ab-scrim',
                    default: 'grey-950 at 45%',
                    description: 'Modal backdrop colour (global token).',
                },
                {
                    name: '--ab-radius-sheet',
                    default: '20px',
                    description: 'Top corner radius (global token).',
                },
            ],
        },
        {
            name: 'AbBottomSheetController',
            inputs: [
                {
                    name: 'heading',
                    type: 'string',
                    default: 'required',
                    description:
                        'Config passed to open(component, config). Also accepts subheading, showHandle, dismissible, compact and closeLabel, which match the component inputs.',
                },
                {
                    name: 'inputs',
                    type: 'Partial<inputs of the component>',
                    default: 'none',
                    description:
                        "Values for the opened component's input() and model() members, type-checked against it.",
                },
                {
                    name: 'footer',
                    type: 'Type<unknown>',
                    default: 'none',
                    description: 'Component rendered in the pinned footer.',
                },
                {
                    name: 'injector',
                    type: 'Injector',
                    default: 'root injector',
                    description: 'Parent injector for the opened component.',
                },
            ],
            outputs: [
                {
                    name: 'ref.afterClosed()',
                    payload: 'Observable<R | undefined>',
                    description:
                        'Emits once after the exit animation with the value passed to ref.close(value), or undefined when the user dismissed the sheet, then completes.',
                },
            ],
        },
    ],
    keyboard: [
        { keys: ['Esc'], action: 'Closes a dismissible modal sheet.' },
        {
            keys: ['Tab'],
            action: 'Cycles focus inside a modal sheet. It never reaches the page behind.',
        },
        {
            keys: ['Enter', 'Space'],
            action: 'Activates the header button: close, expand or collapse.',
        },
    ],
    aria: [
        'A modal sheet has role="dialog" and aria-modal="true", is labelled by its heading, moves focus inside when it opens and returns it to the previous element when it closes.',
        'A standard sheet is a role="region" labelled by its heading. Its header button carries aria-expanded, and the collapsed body and footer are inert so hidden controls are not focusable.',
        'Dragging is a shortcut only. The header button and, for modal sheets, Esc offer the same actions without a pointer.',
        'The modal sheet renders in an overlay on document.body. Include the overlay Sass mixin once, and note that a data-ab-theme scoped to an ancestor is copied onto the overlay.',
        'Sheets opened through AbBottomSheetController are modal, one at a time, and hosted on document.body, so a data-ab-theme scoped to a subtree is not inherited. Use inject(AbBottomSheetRef) in the opened component to close it with a result.',
        'Motion is disabled with prefers-reduced-motion.',
    ],
    bestPractices: [],
    related: ['button', 'chip'],
};
