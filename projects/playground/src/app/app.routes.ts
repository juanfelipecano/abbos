import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'input',
    loadComponent: () => import('./pages/input-demo/input-demo').then((m) => m.InputDemo),
  },
];
