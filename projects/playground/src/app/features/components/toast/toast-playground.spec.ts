import { TestBed } from '@angular/core/testing';
import { provideAbbos } from 'abbos';
import { ToastPlayground } from './toast-playground';

describe('ToastPlayground', () => {
    const create = () => {
        TestBed.configureTestingModule({
            imports: [ToastPlayground],
            providers: [provideAbbos()],
        });
        const fixture = TestBed.createComponent(ToastPlayground);
        fixture.detectChanges();
        return fixture.componentInstance as unknown as {
            state: ToastPlayground['state'];
            code: ToastPlayground['code'];
        };
    };

    it('prints only non-default options', () => {
        expect(create().code()).toBe(
            "this.toasts.show({\n  message: 'Conversation archived',\n  actionLabel: 'Undo',\n});",
        );
    });

    it('writes changed options into the snippet', () => {
        const playground = create();
        playground.state.write('severity', 'error');
        playground.state.write('persistent', true);
        expect(playground.code()).toContain("severity: 'error'");
        expect(playground.code()).toContain('duration: 0');
    });

    it('prints position and mode only when they differ from the defaults', () => {
        const playground = create();
        playground.state.write('position', 'top-right');
        playground.state.write('mode', 'stacked');
        expect(playground.code()).toContain("position: 'top-right'");
        expect(playground.code()).toContain("mode: 'stacked'");
        expect(playground.code()).not.toContain('maxVisible');
        playground.state.write('maxVisible', '5');
        expect(playground.code()).toContain('maxVisible: 5');
    });
});
