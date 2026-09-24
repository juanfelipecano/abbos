import { Component, signal } from '@angular/core';
import { LucideBell, LucideGlobe } from '@lucide/angular';
import { AbIcon, AbSegmentedToggle, AbSettingsItem, AbSettingsList, AbSwitch } from 'abbos';
import { ExampleDef } from '../../../../core/docs/doc.model';
import { exampleFiles } from '../../../../shared/docs/example-files';
import controls from './settings-list-controls.html' with { loader: 'text' };
import disabled from './settings-list-disabled.html' with { loader: 'text' };
import icons from './settings-list-icons.html' with { loader: 'text' };
import navigable from './settings-list-navigable.html' with { loader: 'text' };

const LIST_STYLES = `
    :host {
        width: min(400px, 100%);
    }
    .status {
        margin: 0;
        font: var(--ab-text-caption);
        color: var(--ab-text-secondary);
    }
`;
const LIST = ['AbSettingsList', 'AbSettingsItem'];

@Component({
    selector: 'app-settings-list-navigable',
    imports: [AbSettingsList, AbSettingsItem],
    templateUrl: './settings-list-navigable.html',
    styles: LIST_STYLES,
    host: { class: 'pg-stack' },
})
export class SettingsListNavigable {
    protected readonly opened = signal<string | null>(null);
}

@Component({
    selector: 'app-settings-list-controls',
    imports: [AbSettingsList, AbSettingsItem, AbSegmentedToggle, AbSwitch],
    templateUrl: './settings-list-controls.html',
    styles: LIST_STYLES,
    host: { class: 'pg-stack' },
})
export class SettingsListControls {
    protected readonly twoDecimals = signal(false);
    protected readonly compact = signal(true);
}

@Component({
    selector: 'app-settings-list-icons',
    imports: [AbSettingsList, AbSettingsItem, AbIcon],
    templateUrl: './settings-list-icons.html',
    styles: LIST_STYLES,
    host: { class: 'pg-stack' },
})
export class SettingsListIcons {
    protected readonly Bell = LucideBell;
    protected readonly Globe = LucideGlobe;
}

@Component({
    selector: 'app-settings-list-disabled',
    imports: [AbSettingsList, AbSettingsItem],
    templateUrl: './settings-list-disabled.html',
    styles: LIST_STYLES,
    host: { class: 'pg-stack' },
})
export class SettingsListDisabled {}

export const SETTINGS_LIST_EXAMPLES: readonly ExampleDef[] = [
    {
        id: 'navigable',
        title: 'Navigable rows',
        description: 'navigable turns the row into a button with a chevron that emits activated.',
        component: SettingsListNavigable,
        files: exampleFiles({
            name: 'settings-list-navigable',
            html: navigable,
            imports: LIST,
            core: ['signal'],
            body: '  opened = signal<string | null>(null);',
            layout: 'stack',
        }),
    },
    {
        id: 'controls',
        title: 'Inline controls',
        description: 'Project a control into [abControl]. It needs its own accessible name.',
        component: SettingsListControls,
        files: exampleFiles({
            name: 'settings-list-controls',
            html: controls,
            imports: [...LIST, 'AbSegmentedToggle', 'AbSwitch'],
            core: ['signal'],
            body: '  twoDecimals = signal(false);\n  compact = signal(true);',
            layout: 'stack',
        }),
    },
    {
        id: 'icons',
        title: 'Leading icons',
        description: 'Project an AbIcon into [abIcon] to lead the row.',
        component: SettingsListIcons,
        files: exampleFiles({
            name: 'settings-list-icons',
            html: icons,
            imports: [...LIST, 'AbIcon'],
            extraImports: ["import { LucideBell, LucideGlobe } from '@lucide/angular';"],
            body: '  Bell = LucideBell;\n  Globe = LucideGlobe;',
            layout: 'stack',
        }),
    },
    {
        id: 'disabled',
        title: 'Disabled and long values',
        description:
            'Disabled rows stay visible but inert; long values truncate instead of wrapping.',
        component: SettingsListDisabled,
        files: exampleFiles({
            name: 'settings-list-disabled',
            html: disabled,
            imports: LIST,
            layout: 'stack',
        }),
    },
];
