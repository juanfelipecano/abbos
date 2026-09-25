import { TestBed } from '@angular/core/testing';
import { provideAbbos } from 'abbos';
import { EmptyStatePlayground } from './empty-state-playground';

describe('EmptyStatePlayground', () => {
    const create = () => {
        TestBed.configureTestingModule({
            imports: [EmptyStatePlayground],
            providers: [provideAbbos()],
        });
        const fixture = TestBed.createComponent(EmptyStatePlayground);
        fixture.detectChanges();
        return fixture.componentInstance as unknown as {
            state: EmptyStatePlayground['state'];
            code: EmptyStatePlayground['code'];
        };
    };

    it('omits inputs that are at their defaults', () => {
        const code = create().code();
        expect(code).toContain('<ab-empty-state title="Create your first project"');
        expect(code).toContain('<ab-icon abMedia [icon]="folderPlus" tone="primary"');
        expect(code.split('\n')[0]).not.toContain('size=');
        expect(code).toContain('abActions');
    });

    it('writes changed inputs into the snippet', () => {
        const playground = create();
        playground.state.write('tone', 'danger');
        playground.state.write('size', 'sm');
        playground.state.write('actions', false);
        const code = playground.code();
        expect(code).toContain('tone="danger"');
        expect(code.split('\n')[0]).toContain('size="sm"');
        expect(code).not.toContain('abActions');
    });
});
