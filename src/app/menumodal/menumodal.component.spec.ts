import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MenumodalComponent } from './menumodal.component';

describe('MenumodalComponent', () => {
    let component: MenumodalComponent;
    let fixture: ComponentFixture<MenumodalComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ MenumodalComponent ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MenumodalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
