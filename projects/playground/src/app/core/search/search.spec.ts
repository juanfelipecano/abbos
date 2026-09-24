import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Search } from './search';

describe('Search', () => {
    let search: Search;
    let router: Router;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideRouter([])] });
        search = TestBed.inject(Search);
        router = TestBed.inject(Router);
    });

    it('opens with an empty query and suggestions', () => {
        search.setQuery('stale');
        search.open();
        expect(search.isOpen()).toBe(true);
        expect(search.query()).toBe('');
        expect(search.view().groups.map((group) => group.label)).toEqual(['Jump to']);
    });

    it('wraps the keyboard cursor at both ends', () => {
        search.open();
        const count = search.view().flat.length;
        search.move(-1);
        expect(search.activeIndex()).toBe(count - 1);
        search.move(1);
        expect(search.activeIndex()).toBe(0);
    });

    it('navigates to the active hit, closes and remembers it', () => {
        const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
        search.open();
        search.setQuery('switch');
        search.openActive();

        expect(navigate).toHaveBeenCalledWith(['/components/switch'], { fragment: undefined });
        expect(search.isOpen()).toBe(false);

        search.open();
        expect(search.view().groups[0]).toMatchObject({ label: 'Recent' });
        expect(search.view().groups[0].hits[0]).toMatchObject({ title: 'Switch', match: '' });
    });
});
