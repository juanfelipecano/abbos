import { Routes } from '@angular/router';
import { CATEGORIES, CATEGORY_ORDER } from './core/docs/categories';
import { DOC_ENTRIES, entryPath } from './core/docs/docs-registry';

const TITLE = 'Abbos';

/** Paths of the old one-page demos, kept so existing bookmarks still land somewhere. */
const LEGACY_PATHS = ['button', 'input', 'switch', 'segmented-toggle', 'icon', 'settings-list'];

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        title: `Getting started · ${TITLE}`,
        loadComponent: () => import('./features/home/home'),
    },
    ...CATEGORY_ORDER.map((id) => ({
        path: id,
        title: `${CATEGORIES[id].title} · ${TITLE}`,
        data: { category: id, wide: true },
        loadComponent: () => import('./features/category/category'),
    })),
    ...DOC_ENTRIES.map((entry) => ({
        path: entryPath(entry).slice(1),
        title: `${entry.title} · ${TITLE}`,
        loadComponent: entry.loadPage,
    })),
    ...LEGACY_PATHS.map((path) => ({ path, redirectTo: `components/${path}` })),
    { path: '**', redirectTo: '' },
];
