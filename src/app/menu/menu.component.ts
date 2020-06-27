import { Component, Directive, Input, ViewChild, ElementRef,
            OnInit, TemplateRef, ViewContainerRef, ChangeDetectionStrategy,
            ChangeDetectorRef } from '@angular/core';
import { TemplatePortal } from '@angular/cdk/portal';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { BehaviorSubject, Subject, Subscription, fromEvent } from 'rxjs';
import { MatMenuTrigger} from '@angular/material/menu';
import { take, filter } from "rxjs/operators";
import { Song } from '../models/song';
import { Playlist } from '../models/playlist';
import { MatDialog } from '@angular/material/dialog';
import { SongmodalComponent } from '../songmodal/songmodal.component';
import { PlaylistmodalComponent } from '../playlistmodal/playlistmodal.component';
import { MenumodalComponent } from '../menumodal/menumodal.component';
import {MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltipDefaultOptions} from '@angular/material/tooltip';
const electron = (<any>window).require('electron');
const { remote } = (<any>window).require('electron');

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss'],
    providers: [
        {
            provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: {
                showDelay: 1000,
                hideDelay: 500,
                touchendHideDelay: 500,
            }
        }
    ],
})
export class MenuComponent implements OnInit {

    currentPlaylist: Playlist;
    allPlaylists: Playlist[];

    @ViewChild(MatMenuTrigger)
    contextMenu: MatMenuTrigger;

    contextMenuPosition = { x: '0px', y: '0px' };

    constructor(public dialog: MatDialog, public overlay: Overlay,
        public viewContainerRef: ViewContainerRef, private cdr: ChangeDetectorRef) {
        electron.ipcRenderer.on('send-playlists', async(event, data) => {
            this.allPlaylists = data;
            if (this.allPlaylists.length >= 1 && this.currentPlaylist == null) {
                this.currentPlaylist = this.allPlaylists[0];
            }
            this.cdr.detectChanges();
        });
		
		electron.ipcRenderer.on("swap-to-playlist-name", async(event, name, uuid) => {
			for( var i = 0; i< this.allPlaylists.length; i++) {
				if( this.allPlaylists[i].name == name) {
					this.swapToPlaylist(this.allPlaylists[i]);
					break;
				}
			}
			electron.ipcRenderer.send("send-playlist-status", this.currentPlaylist, uuid);
		});

        electron.ipcRenderer.on("send-playlist", async(event, data) => {
            this.currentPlaylist = data;
            this.cdr.detectChanges();
        });

        electron.ipcRenderer.on("get-current-playlist-name", async(event) => {
            electron.ipcRenderer.send("send-current-playlist-name", this.currentPlaylist.name);
        });
		
		electron.ipcRenderer.on("get-playlist-status", async(event, uuid) => {
			electron.ipcRenderer.send("send-playlist-status", this.currentPlaylist, uuid);
		});

		electron.ipcRenderer.on("get-playlist-name-status", async(event, uuid) => {
			electron.ipcRenderer.send("send-playlist-name-status", this.currentPlaylist.name, uuid);
		});

        electron.ipcRenderer.send("get-playlists");
        electron.ipcRenderer.send("get-playlist", "Default");
    }

    closeApp() {
        var window = remote.BrowserWindow.getFocusedWindow();
        if(window == null) {return};
        window.close();
    }

    minimizeApp() {
        var window = remote.BrowserWindow.getFocusedWindow();
        if(window == null) {return};
        window.minimize();
    }

    maximizeApp() {
        var window = remote.BrowserWindow.getFocusedWindow();
        if(window == null) {return};
        window.isMaximized() ? window.unmaximize() : window.maximize();
    }

    getIsMaximized() {
        var window = remote.BrowserWindow.getFocusedWindow();
        if(window == null) {return};
        return window.isMaximized();
    }

    comparePLByName(pl1: Playlist, pl2: Playlist) {
        return pl1 && pl2 && pl1.name === pl2.name;
    }

    onContextMenu(event: MouseEvent, playlist: Playlist) {
        event.preventDefault();
        this.contextMenuPosition.x = event.clientX + 'px';
        this.contextMenuPosition.y = event.clientY + 'px';
        this.contextMenu.menuData = { 'playlist': playlist };
        this.contextMenu.menu.focusFirstItem('mouse');
        this.contextMenu.openMenu();
        this.cdr.detectChanges();
    }

    ngOnInit(): void {
        this.cdr.detectChanges();
        this.forceUpdates();
    }

    async forceUpdates() {
        setTimeout( () => {this.cdr.detectChanges(), this.forceUpdates()} , 100)
    }
    changePlaylist(playlist) {
        this.swapToPlaylist(playlist)
        this.cdr.detectChanges();
    }

    swapToPlaylist(playlist) {
        this.currentPlaylist = playlist;
        electron.ipcRenderer.send("get-playlist", this.currentPlaylist.name);
    }

    removePlaylist(playlist) {
        electron.ipcRenderer.send("remove-playlist", playlist);
        if(this.currentPlaylist.name == playlist.name) {
            electron.ipcRenderer.send("get-playlist", "Default");
        }
        this.allPlaylists = this.allPlaylists.filter( function (value, index, arr) {
            return value.name != playlist.name ;
        });
        this.cdr.detectChanges();
    }

    createPlaylist() {
        const dialogRef = this.dialog.open(PlaylistmodalComponent, {
            width: 'auto',
            height: 'auto',
        });
    }

    openAddSongModal(){
        const dialogRef = this.dialog.open(SongmodalComponent, {
            width: 'auto',
            height: 'auto',
        });
    }
    openMenu() {
        const dialogRef = this.dialog.open(MenumodalComponent, {
            width: 'auto',
            height: 'auto',
        });
    }
}
