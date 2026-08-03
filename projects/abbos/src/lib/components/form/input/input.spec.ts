import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbInput } from './input';

@Component({
    imports: [AbInput],
    template: `<input ab-input />`,
})
class TestHost {}

describe('AbInput', () => {
    let fixture: ComponentFixture<TestHost>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TestHost],
        }).compileComponents();

        fixture = TestBed.createComponent(TestHost);
        await fixture.whenStable();
    });

    it('renders as a plain native input with no label, wrapper, or projected content', () => {
        const host: HTMLElement = fixture.nativeElement;
        const input = host.querySelector('input[ab-input]');

        expect(input).toBeTruthy();
        expect(host.querySelectorAll('input').length).toBe(1);
        expect(host.querySelector('label')).toBeNull();
        expect(input?.children.length).toBe(0);
    });
});
