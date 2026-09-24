import { Component, computed } from '@angular/core';
import { LucideBell } from '@lucide/angular';
import { AbIcon, AbSettingsItem, AbSettingsList, AbSwitch } from 'abbos';
import { PlaygroundFrame } from '../../../shared/ui/playground-frame/playground-frame';
import { attrs, PlaygroundState } from '../../../shared/ui/playground-frame/playground-state';

@Component({
    selector: 'app-settings-list-playground',
    imports: [PlaygroundFrame, AbSettingsList, AbSettingsItem, AbSwitch, AbIcon],
    template: `
        <app-playground-frame
            [model]="state"
            [code]="code()"
            fileName="settings-list-playground.html"
        >
            @let s = state.value();
            <ab-settings-list class="list" ariaLabel="Preferences">
                <ab-settings-item
                    [label]="s.label"
                    [description]="s.description || undefined"
                    [value]="s.trailing === 'value' ? s.value : undefined"
                    [navigable]="s.trailing === 'value'"
                    [disabled]="s.disabled"
                >
                    @if (s.icon) {
                        <ab-icon
                            abIcon
                            [icon]="bell"
                            tone="primary"
                            appearance="soft"
                            shape="round"
                        />
                    }
                    @if (s.trailing === 'switch') {
                        <ab-switch
                            abControl
                            size="sm"
                            [ariaLabel]="s.label"
                            [disabled]="s.disabled"
                        />
                    }
                </ab-settings-item>
                <ab-settings-item label="Time zone" value="America/Bogotá" navigable />
            </ab-settings-list>
        </app-playground-frame>
    `,
    styles: `
        .list {
            width: min(360px, 100%);
        }
    `,
})
export class SettingsListPlayground {
    protected readonly bell = LucideBell;

    protected readonly state = new PlaygroundState(
        {
            trailing: 'value',
            label: 'Notifications',
            description: 'Push and email',
            value: 'On',
            icon: true,
            disabled: false,
        },
        [
            { kind: 'select', key: 'trailing', label: 'Trailing', options: ['value', 'switch'] },
            { kind: 'text', key: 'label', label: 'Label' },
            { kind: 'text', key: 'description', label: 'Description' },
            { kind: 'text', key: 'value', label: 'Value' },
            { kind: 'toggle', key: 'icon', label: 'Leading icon' },
            { kind: 'toggle', key: 'disabled', label: 'Disabled' },
        ],
    );

    protected readonly code = computed(() => {
        const s = this.state.value();
        const navigable = s.trailing === 'value';
        const list = attrs(
            `label="${s.label}"`,
            s.description && `description="${s.description}"`,
            navigable && `value="${s.value}"`,
            navigable && 'navigable',
            s.disabled && 'disabled',
            navigable && '(activated)="open()"',
        );
        const children = [
            s.icon &&
                '    <ab-icon abIcon [icon]="Bell" tone="primary" appearance="soft" shape="round" />',
            !navigable && `    <ab-switch abControl size="sm" ariaLabel="${s.label}" />`,
        ].filter(Boolean);
        const item = children.length
            ? `  <ab-settings-item ${list}>\n${children.join('\n')}\n  </ab-settings-item>`
            : `  <ab-settings-item ${list} />`;
        return `<ab-settings-list ariaLabel="Preferences">\n${item}\n</ab-settings-list>`;
    });
}
