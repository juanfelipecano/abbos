import { TestBed } from '@angular/core/testing';
import { provideAbbos } from 'abbos';
import { DatePickerPlayground } from './date-picker-playground';

describe('DatePickerPlayground', () => {
    const create = () => {
        TestBed.configureTestingModule({
            imports: [DatePickerPlayground],
            providers: [provideAbbos()],
        });
        const fixture = TestBed.createComponent(DatePickerPlayground);
        fixture.detectChanges();
        return fixture.componentInstance as unknown as {
            state: DatePickerPlayground['state'];
            code: DatePickerPlayground['code'];
        };
    };

    it('omits inputs that are at their defaults', () => {
        expect(create().code()).toBe(
            `<button ab-button variant="outline" [abDatePickerTrigger]="picker">\n  {{ picker.displayText() || 'Pick a date' }}\n</button>\n<ab-date-picker #picker [(value)]="value" />`,
        );
    });

    it('writes changed inputs into the snippet', () => {
        const playground = create();
        playground.state.write('trigger', 'input');
        playground.state.write('mode', 'range');
        playground.state.write('format', 'yyyy-MM-dd');

        expect(playground.code()).toBe(
            '<input ab-input aria-label="Date" [abDatePickerTrigger]="picker" />\n<ab-date-picker #picker [(value)]="value" mode="range" format="yyyy-MM-dd" />',
        );
    });
});
