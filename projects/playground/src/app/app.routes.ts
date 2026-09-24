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
        path: 'logo',
        loadComponent: () => import('./pages/logo-demo/logo-demo').then((m) => m.LogoDemo),
    },
];
