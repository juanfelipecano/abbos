import { TestBed } from '@angular/core/testing';
import { provideAbbos } from 'abbos';
import { ChipPlayground } from './chip-playground';

describe('ChipPlayground', () => {
    const create = () => {
        TestBed.configureTestingModule({
            imports: [ChipPlayground],
            providers: [provideAbbos()],
        });
        const fixture = TestBed.createComponent(ChipPlayground);
        fixture.detectChanges();
        return fixture.componentInstance as unknown as {
            state: ChipPlayground['state'];
            code: ChipPlayground['code'];
        };
    };

    it('omits inputs that are at their defaults', () => {
        expect(create().code()).toBe('<ab-chip>Design</ab-chip>');
    });

    it('writes changed inputs into the snippet and resets them', () => {
        const playground = create();
        playground.state.write('variant', 'soft');
        playground.state.write('removable', true);
        playground.state.write('size', 'sm');
        expect(playground.code()).toBe(
            '<ab-chip variant="soft" size="sm" removable>Design</ab-chip>',
        );

        playground.state.reset();
        expect(playground.state.value().variant).toBe('neutral');
    });
});
