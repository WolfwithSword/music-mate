import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ClipboardModule } from '@angular/cdk/clipboard';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {OverlayContainer, OverlayModule} from '@angular/cdk/overlay';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PlayerComponent } from './player/player.component';

import { AppRoutingModule } from './app-routing.module';
import { MenuComponent } from './menu/menu.component';
import { MainComponent } from './main/main.component';
import { MaterialModule } from './material.module';
import { SongmodalComponent } from './songmodal/songmodal.component';
import { PlaylistmodalComponent } from './playlistmodal/playlistmodal.component';
import { MenumodalComponent } from './menumodal/menumodal.component';

@NgModule({
    declarations: [
        AppComponent,
        PlayerComponent,
        MenuComponent,
        MainComponent,
        SongmodalComponent,
        PlaylistmodalComponent,
        MenumodalComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        OverlayModule,
        ClipboardModule
    ],
    exports: [
        MaterialModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {}