import { TestBed } from '@angular/core/testing';
import { provideAbbos } from 'abbos';
import { BottomSheetPlayground } from './bottom-sheet-playground';

describe('BottomSheetPlayground', () => {
    const create = () => {
        TestBed.configureTestingModule({
            imports: [BottomSheetPlayground],
            providers: [provideAbbos()],
        });
        const fixture = TestBed.createComponent(BottomSheetPlayground);
        fixture.detectChanges();
        return fixture.componentInstance as unknown as {
            state: BottomSheetPlayground['state'];
            code: BottomSheetPlayground['code'];
        };
    };

    it('prints only non-default inputs', () => {
        expect(create().code()).toBe(
            '<ab-bottom-sheet [(open)]="open" heading="Share">\n  Body content\n</ab-bottom-sheet>',
        );
    });

    it('writes changed inputs into the snippet', () => {
        const playground = create();
        playground.state.write('mode', 'standard');
        playground.state.write('dismissible', false);
        expect(playground.code()).toContain('mode="standard"');
        expect(playground.code()).toContain('[dismissible]="false"');
    });
});
