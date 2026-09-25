import { InjectionToken } from '@angular/core';

/**
 * The clock the date picker reads "today" from. Override it to pin the date in tests or demos:
 * `{ provide: AB_DATE_NOW, useValue: () => new Date(2026, 1, 1) }`.
 */
export const AB_DATE_NOW = new InjectionToken<() => Date>('AbDateNow', {
    providedIn: 'root',
    factory: () => () => new Date(),
});
