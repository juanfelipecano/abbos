import { TestBed } from '@angular/core/testing';
import { provideAbbos } from 'abbos';
import { SkeletonPlayground } from './skeleton-playground';

describe('SkeletonPlayground', () => {
    const create = () => {
        TestBed.configureTestingModule({
            imports: [SkeletonPlayground],
            providers: [provideAbbos()],
        });
        const fixture = TestBed.createComponent(SkeletonPlayground);
        fixture.detectChanges();
        return fixture.componentInstance as unknown as {
            state: SkeletonPlayground['state'];
            code: SkeletonPlayground['code'];
        };
    };

    it('omits inputs that are at their defaults', () => {
        const playground = create();
        playground.state.write('variant', 'rect');
        expect(playground.code()).toBe('<ab-skeleton />');
    });

    it('writes changed inputs into the snippet', () => {
        const playground = create();
        expect(playground.code()).toBe('<ab-skeleton variant="text" lines="3" />');

        playground.state.write('animation', 'shimmer');
        playground.state.write('width', '60%');
        const code = playground.code();
        expect(code).toContain('width="60%"');
        expect(code).toContain('animation="shimmer"');
    });
});
