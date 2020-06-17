import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylistmodalComponent } from './playlistmodal.component';

describe('PlaylistmodalComponent', () => {
    let component: PlaylistmodalComponent;
    let fixture: ComponentFixture<PlaylistmodalComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ PlaylistmodalComponent ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PlaylistmodalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
