import { TestBed } from '@angular/core/testing';
import { provideAbbos } from 'abbos';
import { ButtonPlayground } from './button-playground';

describe('ButtonPlayground', () => {
    const create = () => {
        TestBed.configureTestingModule({
            imports: [ButtonPlayground],
            providers: [provideAbbos()],
        });
        const fixture = TestBed.createComponent(ButtonPlayground);
        fixture.detectChanges();
        return fixture.componentInstance as unknown as {
            state: ButtonPlayground['state'];
            code: ButtonPlayground['code'];
        };
    };

    it('omits inputs that are at their defaults', () => {
        expect(create().code()).toBe('<button ab-button>\n  Save changes\n</button>');
    });

    it('writes changed inputs into the snippet and resets them', () => {
        const playground = create();
        playground.state.write('variant', 'soft');
        playground.state.write('size', 'sm');
        playground.state.write('loading', true);
        expect(playground.code()).toBe(
            '<button ab-button variant="soft" size="sm" [loading]="true">\n  Save changes\n</button>',
        );

        playground.state.reset();
        expect(playground.state.value().variant).toBe('primary');
    });
});
