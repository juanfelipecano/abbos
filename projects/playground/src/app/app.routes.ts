import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'input',
        loadComponent: () => import('./pages/input-demo/input-demo').then((m) => m.InputDemo),
    },
    {
        path: 'button',
        loadComponent: () => import('./pages/button-demo/button-demo').then((m) => m.ButtonDemo),
    },
    {
        path: 'switch',
        loadComponent: () => import('./pages/switch-demo/switch-demo').then((m) => m.SwitchDemo),
    },
    {
        path: 'segmented-toggle',
        loadComponent: () =>
            import('./pages/segmented-toggle-demo/segmented-toggle-demo').then(
                (m) => m.SegmentedToggleDemo,
            ),
    },
    {
        path: 'settings-list',
        loadComponent: () =>
            import('./pages/settings-list-demo/settings-list-demo').then((m) => m.SettingsListDemo),
    },
    {
        path: 'icon',
        loadComponent: () => import('./pages/icon-demo/icon-demo').then((m) => m.IconDemo),
    },
];
