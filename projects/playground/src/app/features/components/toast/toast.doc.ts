import { ComponentDoc } from '../../../core/docs/doc.model';
import { TOAST_EXAMPLES } from './examples/toast-examples';

export const TOAST_DOC: ComponentDoc = {
    slug: 'toast',
    examples: TOAST_EXAMPLES,
    api: [
        {
            name: 'AbToastController',
            inputs: [
                {
                    name: 'message',
                    type: 'string',
                    default: 'required',
                    description:
                        'Config passed to show(config). show also accepts a plain string. Keep it to one or two lines; longer text is clamped.',
                },
                {
                    name: 'actionLabel',
                    type: 'string',
                    default: 'none',
                    description:
                        'Label of the single text action. Name what it does ("Undo", "Retry"), never "Dismiss".',
                },
                {
                    name: 'severity',
                    type: "'neutral' | 'success' | 'info' | 'error'",
                    default: "'neutral'",
                    description:
                        'Adds an icon. Error toasts are announced assertively, the rest politely.',
                },
                {
                    name: 'position',
                    type: "'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'center'",
                    default: "'bottom-center'",
                    description:
                        'Where it appears. Every position has its own queue, so toasts at different positions show together.',
                },
                {
                    name: 'mode',
                    type: "'queue' | 'stacked' | 'expanded'",
                    default: "'queue'",
                    description:
                        'queue shows one at a time and queues the rest (Material 3). stacked folds several into a pile that fans out on hover or focus. expanded always lists them. The mode belongs to the position: the latest toast shown there decides it, so do not mix modes in one position.',
                },
                {
                    name: 'maxVisible',
                    type: 'number',
                    default: '3',
                    description:
                        'stacked and expanded only: how many show at once. The rest wait and appear as others leave.',
                },
                {
                    name: 'duration',
                    type: 'number',
                    default: '4000, or 8000 with an action',
                    description:
                        'Milliseconds before it dismisses itself. 0 keeps it until dismissed.',
                },
                {
                    name: 'dismissible',
                    type: 'boolean',
                    default: 'false',
                    description:
                        'Shows a close button. It is always shown for a persistent toast without an action.',
                },
                {
                    name: 'closeLabel',
                    type: 'string',
                    default: "'Dismiss'",
                    description: 'Accessible name of the close button. Localise it.',
                },
            ],
            outputs: [
                {
                    name: 'show() → AbToastRef',
                    payload: 'dismiss(), afterDismissed(), onAction()',
                    description:
                        'dismiss() removes the toast or takes it out of the queue. afterDismissed() emits once after the exit transition with "timeout", "action" or "dismiss". onAction() emits when the action is taken.',
                },
                {
                    name: 'success / info / error',
                    payload: '(message, config?) → AbToastRef',
                    description: 'Shorthands for show with a severity.',
                },
                {
                    name: 'dismiss() / dismissAll()',
                    payload: 'void',
                    description:
                        'dismiss() removes the newest toast on screen. dismissAll() removes every toast on screen and everything waiting.',
                },
            ],
        },
        {
            name: 'AbToast',
            inputs: [
                { name: 'message', type: 'string', default: 'required', description: 'The text.' },
                {
                    name: 'actionLabel',
                    type: 'string',
                    default: 'none',
                    description: 'Renders the action button.',
                },
                {
                    name: 'severity',
                    type: "'neutral' | 'success' | 'info' | 'error'",
                    default: "'neutral'",
                    description: 'Adds an icon.',
                },
                {
                    name: 'dismissible',
                    type: 'boolean',
                    default: 'false',
                    description: 'Renders the close button.',
                },
                {
                    name: 'closeLabel',
                    type: 'string',
                    default: "'Dismiss'",
                    description: 'Accessible name of the close button.',
                },
            ],
            outputs: [
                { name: 'action', payload: 'void', description: 'The action was clicked.' },
                {
                    name: 'dismissed',
                    payload: 'void',
                    description: 'The close button or Esc was used.',
                },
            ],
            cssVars: [
                {
                    name: '--ab-toast-offset',
                    default: 'var(--ab-space-4)',
                    description:
                        'Controller only: gap above the bottom edge. Raise it to clear a bottom bar or a standard-mode bottom sheet.',
                },
                {
                    name: '--ab-toast-bg / --ab-toast-fg',
                    default: 'var(--ab-text) / var(--ab-surface)',
                    description:
                        'Background and text colour. The default is the inverse of the page, so it contrasts in both themes.',
                },
            ],
        },
    ],
    keyboard: [
        {
            keys: ['Tab'],
            action: 'Reaches the action and the close button. The toast is never focused for you.',
        },
        { keys: ['Enter', 'Space'], action: 'Activates the focused button.' },
        { keys: ['Esc'], action: 'Dismisses the toast while focus is inside it.' },
    ],
    aria: [
        'Toasts render inside a role="status" (aria-live="polite") region, or a role="alert" region for errors. Both regions exist before any message appears, so screen readers announce it.',
        'Focus is never moved. The timers of a position pause while the pointer or keyboard focus is on its toasts, and resume with the time that was left.',
        'Every position renders its live regions empty before its first toast is put in them. Regions do not repeat the whole stack on each change (aria-atomic is false), so each new toast is announced on its own.',
        'In a stacked pile, the toasts folded behind the front one are inert and aria-hidden, so hidden buttons are not focusable. Focusing the front toast, or hovering the pile, fans it out and makes every toast interactive.',
        'At top positions the newest toast is first in the tab order, the same as on screen; at bottom positions the newest is last.',
        'A toast is not a place for anything the user must read or act on. Errors that block a task belong inline or in a dialog; use a persistent toast only for status that is still true.',
        'AbToast has no live-region role of its own. If you place it by hand, wrap it in role="status" or role="alert".',
        'The controller hosts toasts on document.body, so a data-ab-theme scoped to a subtree is not inherited. Motion is disabled with prefers-reduced-motion.',
    ],
    bestPractices: [],
    related: ['bottom-sheet', 'button'],
};
