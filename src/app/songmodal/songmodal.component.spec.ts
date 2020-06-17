import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SongmodalComponent } from './songmodal.component';

describe('SongmodalComponent', () => {
    let component: SongmodalComponent;
    let fixture: ComponentFixture<SongmodalComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ SongmodalComponent ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SongmodalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
