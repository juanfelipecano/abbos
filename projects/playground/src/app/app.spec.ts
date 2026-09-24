import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideAbbos } from 'abbos';
import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [App],
            providers: [provideRouter(routes), provideAbbos()],
        });
    });

    it('renders the shell around the router outlet', async () => {
        const fixture = TestBed.createComponent(App);
        await fixture.whenStable();
        const element = fixture.nativeElement as HTMLElement;
        expect(element.querySelector('app-header')).toBeTruthy();
        expect(element.querySelector('main router-outlet')).toBeTruthy();
    });

    it('renders a component page with its title', async () => {
        const harness = await RouterTestingHarness.create();
        await harness.navigateByUrl('/components/button');
        expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain('Button');
    });

    it('redirects the old demo paths', async () => {
        const harness = await RouterTestingHarness.create();
        await harness.navigateByUrl('/switch');
        expect(TestBed.inject(Router).url).toBe('/components/switch');
    });
});
