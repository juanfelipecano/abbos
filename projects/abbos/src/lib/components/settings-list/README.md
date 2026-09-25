# Settings list

A card that groups settings rows. Made of `ab-settings-list` and `ab-settings-item`.

- **Selectors:** `ab-settings-list`, `ab-settings-item`
- **Classes:** `AbSettingsList`, `AbSettingsItem`

```ts
import { AbSettingsList, AbSettingsItem } from '@juanfelipecano/abbos';
```

```html
<ab-settings-list ariaLabel="Preferences">
    <ab-settings-item label="Notifications" description="Push and email">
        <ab-switch abControl [(checked)]="notifications" ariaLabel="Notifications" />
    </ab-settings-item>

    <ab-settings-item label="Language" value="English" navigable (activated)="openLanguage()">
        <ab-icon abIcon [icon]="globe" />
    </ab-settings-item>
</ab-settings-list>
```

## `ab-settings-list`

| Input       | Type     | Description                                  |
| ----------- | -------- | -------------------------------------------- |
| `ariaLabel` | `string` | Accessible name of the list (`role="list"`). |

Each row draws its own divider.

## `ab-settings-item`

| Name          | Type           | Default      | Description                                                     |
| ------------- | -------------- | ------------ | --------------------------------------------------------------- |
| `label`       | `string`       | **required** | Row title.                                                      |
| `description` | `string`       | —            | Secondary text (linked with `aria-describedby` when navigable). |
| `value`       | `string`       | —            | Current value shown at the trailing edge.                       |
| `navigable`   | `boolean`      | `false`      | Renders the row as a `<button>` with a chevron.                 |
| `disabled`    | `boolean`      | `false`      | Disables a navigable row.                                       |
| `activated`   | `output<void>` | —            | Emitted when a navigable row is clicked.                        |

Content slots: `[abIcon]` (leading icon) and `[abControl]` (trailing control such as a switch).
