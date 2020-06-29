import { Component, Directive, Input, ViewChild, ElementRef, ChangeDetectionStrategy,
            ChangeDetectorRef,    OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { TemplatePortal } from '@angular/cdk/portal';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { MatMenuTrigger} from '@angular/material/menu';
import { BehaviorSubject, Subject, Subscription, fromEvent } from 'rxjs';
import { take, filter } from "rxjs/operators";
import { Song } from '../models/song';
import { Playlist } from '../models/playlist';
import {MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltipDefaultOptions} from '@angular/material/tooltip';
const electron = (<any>window).require('electron');

@Component({
    selector: 'app-player',
    templateUrl: './player.component.html',
    styleUrls: ['./player.component.scss'],
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

export class PlayerComponent implements OnInit {

    currentProgress$ = new BehaviorSubject(0);
    currentTime$ = new Subject();
    lastTime: string;
    progressVal: number = 0;

    songVolume: number = 50;
    toggleLoop: boolean =false;

    @ViewChild('player', {static: true}) player: ElementRef;
    @ViewChild(MatMenuTrigger)
    contextMenu: MatMenuTrigger;

    contextMenuPosition = { x: '0px', y: '0px' };

    playlist: Playlist;

    isPlaying: boolean = false;
    isTMuted: boolean = false;
    tMutedVol: number;
    activeSong: Song[] = [];
    durationTime: string;

    constructor( public viewContainerRef: ViewContainerRef, public overlay: Overlay,
        private cdr: ChangeDetectorRef) {

        electron.ipcRenderer.on('send-playlist', async(event, playlist) => {
            this.durationTime = null;
            this.player.nativeElement.pause();
            this.isPlaying = false;
            this.playlist = playlist;

            electron.ipcRenderer.send("change-playlist-update", this.playlist.name);
            if (this.playlist.songs.length > 0) {
                this.player.nativeElement.src = this.playlist.songs[0].path;
                this.player.nativeElement.load();
                this.activeSong = [this.playlist.songs[0]];
                electron.ipcRenderer.send("new-song-update", this.playlist.songs[0]);
                electron.ipcRenderer.send("send-playlist-name-status", this.playlist.name, null);
                electron.ipcRenderer.send("send-play-status", false, null);

                electron.ipcRenderer.send("send-song-status-name", this.activeSong[0].title);
                electron.ipcRenderer.send("send-song-status-artist", this.activeSong[0].artist);
                electron.ipcRenderer.send("send-song-status-duration", this.activeSong[0].duration);
                electron.ipcRenderer.send("send-song-link", this.activeSong[0].hasOwnProperty('link') ? this.activeSong[0].link : "");
                electron.ipcRenderer.send("send-current-duration", "0:00");
            }
            else {
                electron.ipcRenderer.send("new-song-update", "");
            }
            this.cdr.detectChanges();
        });

        electron.ipcRenderer.on('update-songs', async(event, newSong, playlistName) => {
            if(playlistName == this.playlist.name && newSong == null) {
                electron.ipcRenderer.send("get-playlist", playlistName);
                return;
            }
            if(this.activeSong == [] || this.activeSong == null || this.playlist.songs.length == 0) {
                this.durationTime = undefined;
                this.player.nativeElement.src = newSong.path;
                this.player.nativeElement.load();
                this.activeSong = [newSong];
            }
            if (playlistName == this.playlist.name) {
                this.playlist.songs.push(newSong);
            }
            this.cdr.detectChanges();
        });

        electron.ipcRenderer.on("play-next", async(event) => {
            this.playNextSong();
        });
        electron.ipcRenderer.on("play-prev", async(event) => {
            this.playPreviousSong();
        });
        electron.ipcRenderer.on("pause", async(event, uuid) => {
            this.player.nativeElement.pause();
            electron.ipcRenderer.send("send-play-status", false, uuid);
        });
        electron.ipcRenderer.on("play", async(event, uuid) => {
            this.player.nativeElement.play();
            electron.ipcRenderer.send("send-play-status", true, uuid);
        });
        electron.ipcRenderer.on("get-play-status", async(event, uuid) => {
            electron.ipcRenderer.send("send-play-status", this.isPlaying, uuid);
        });
        electron.ipcRenderer.on("toggle-pause", async(event, uuid) => {
            if (this.isPlaying) {
                this.player.nativeElement.pause();
                electron.ipcRenderer.send("send-play-status", false, uuid);
            }
            else {
                this.player.nativeElement.play();
                electron.ipcRenderer.send("send-play-status", true, uuid);
            }
        });
        electron.ipcRenderer.on("toggle-loop", async(event, uuid) => {
            this.toggleLoop = !this.toggleLoop;
            electron.ipcRenderer.send("send-loop-status", this.toggleLoop, uuid);
        });
        electron.ipcRenderer.on("get-loop-status", async(event, uuid) => {
            electron.ipcRenderer.send("send-loop-status", this.toggleLoop, uuid);
        });
        electron.ipcRenderer.on("get-volume-level", async(event, uuid) => {
            electron.ipcRenderer.send("send-volume-level", this.songVolume, uuid);
        });
        electron.ipcRenderer.on("toggle-mute", async(event, uuid) => {
            this.toggleVolume();
            electron.ipcRenderer.send("send-volume-level", this.songVolume, uuid);
        });
        electron.ipcRenderer.on("set-volume", async(event, value, uuid) => {
            this.changeVolumeValue(Number(value));
            electron.ipcRenderer.send("send-volume-level", this.songVolume, uuid);
        });
        electron.ipcRenderer.on("modify-volume", async(event, value, uuid) => {
            value = this.songVolume + Number(value);
            this.changeVolumeValue(value);
            electron.ipcRenderer.send("send-volume-level", this.songVolume, uuid);
        });
        electron.ipcRenderer.on("decrease-volume", async(event, value, uuid) => {
            value = this.songVolume - Number(value);
            this.changeVolumeValue(value);
            electron.ipcRenderer.send("send-volume-level", this.songVolume, uuid);
        });
        electron.ipcRenderer.on("increase-volume", async(event, value, uuid) => {
            value = this.songVolume + Number(value);
            this.changeVolumeValue(value);
            electron.ipcRenderer.send("send-volume-level", this.songVolume, uuid);
        });
        electron.ipcRenderer.on("shuffle", async(event) => {
            this.shuffleSongs();
        });

        electron.ipcRenderer.on("get-song-status-name", async(event, uuid) => {
            electron.ipcRenderer.send("send-song-status-name", this.activeSong[0].title, uuid);
        });
        electron.ipcRenderer.on("get-song-status-artist", async(event, uuid) => {
            electron.ipcRenderer.send("send-song-status-artist", this.activeSong[0].artist, uuid);
        });
        electron.ipcRenderer.on("get-song-status-duration", async(event, uuid) => {
            electron.ipcRenderer.send("send-song-status-duration", this.activeSong[0].duration, uuid);
        });
        electron.ipcRenderer.on("get-song-status", async(event, uuid) => {
            electron.ipcRenderer.send("send-song-status", this.activeSong[0], uuid);
        });
        electron.ipcRenderer.on("get-song-link", async(event, uuid) => {
            electron.ipcRenderer.send("send-song-link", this.activeSong[0].hasOwnProperty('link') ? this.activeSong[0].link : "", uuid);
        });
    }

    changeVolumeValue(value) {
        if(value < 0) {
            value = 0;
        }
        if (value > 100) {
            value = 100;
        }
        this.songVolume = value;
    }

    sendVolumeValue() {
        electron.ipcRenderer.send("send-volume-level", this.songVolume, null);
    }

    sendLoopValue() {
        electron.ipcRenderer.send("send-loop-status", this.toggleLoop, null);
    }

    public onEnded(event) {
        if(this.toggleLoop) {
            this.playSong(this.activeSong[0]);
        }
        else {
            this.playNextSong();
        }
    }

    onContextMenu(event: MouseEvent, song: Song) {
        event.preventDefault();
        this.contextMenuPosition.x = event.clientX + 'px';
        this.contextMenuPosition.y = event.clientY + 'px';
        this.contextMenu.menuData = { 'song': song };
        this.contextMenu.menu.focusFirstItem('mouse');
        this.contextMenu.openMenu();
        this.cdr.detectChanges();
    }

    ngOnInit() {
        if(this.playlist != null && this.playlist.songs != []) {
            this.player.nativeElement.src = this.playlist.songs[0].path;
            this.player.nativeElement.load();
            this.player.nativeElement.pause();
        }
        this.isPlaying = false;
        this.cdr.detectChanges();
        this.forceUpdates();
    }

    async forceUpdates() {
        setTimeout( () => {this.cdr.detectChanges(), this.forceUpdates()} , 100);
    }

    shuffleSongs() {
        let array = this.playlist.songs;
            for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        this.playlist.songs = array;
    }

    playSong(song): void {
        electron.ipcRenderer.send("new-song-update", song);
        this.player.nativeElement.pause();

        this.durationTime = undefined;
        this.activeSong = [song];

        this.player.nativeElement.src = song.path;
        this.player.nativeElement.load();

        setTimeout(() => {
            this.player.nativeElement.play();
            this.isPlaying = true;
        }, 100);

        this.adjustArray();
        this.cdr.detectChanges();
        electron.ipcRenderer.send("send-song-status-name", this.activeSong[0].title, null);
        electron.ipcRenderer.send("send-song-status-artist", this.activeSong[0].artist, null);
        electron.ipcRenderer.send("send-song-status-duration", this.activeSong[0].duration, null);
        electron.ipcRenderer.send("send-song-link", this.activeSong[0].hasOwnProperty('link') ? this.activeSong[0].link : "", null);
    }

    adjustArray() {
        let array = this.playlist.songs;
        let found = false;
        while(!found) {
            if (array[0].title != this.activeSong[0].title && array[0].path != this.activeSong[0].path
                && this.playlist.songs[0].artist != this.activeSong[0].artist) {
                    let s = array.shift();
                    array.push(s);
            }
            else{
                this.playlist.songs = array;
                break;
            }
        }
    }

    onTimeUpdate() {
        if (!this.durationTime) {
            this.setSongDuration();
        }

        const currentMinutes = this.generateMinutes(this.player.nativeElement.currentTime);
        const currentSeconds = this.generateSeconds(this.player.nativeElement.currentTime);

        let time = this.generateTimeToDisplay(currentMinutes, currentSeconds);
        if (this.lastTime != time) {
            electron.ipcRenderer.send("send-current-duration", time);
        }
        this.lastTime = time;

        this.currentTime$.next(time);

        let percents = this.generatePercentage(this.player.nativeElement.currentTime, this.player.nativeElement.duration);
        if (percents > 100) {
            percents = 100;
        }
        this.progressVal = percents > 0 ? percents : 0;
        if (!isNaN(percents)) {
          this.currentProgress$.next(percents);
        }
        this.cdr.detectChanges();
    }


    playNextSong(): void {
        const nextSongIndex = this.playlist.songs.findIndex((song) => song.title === this.activeSong[0].title
            && song.artist === this.activeSong[0].artist && song.path === this.activeSong[0].path) + 1;

        if (nextSongIndex === this.playlist.songs.length) {
            this.playSong(this.playlist.songs[0]);
        } else {
             this.playSong(this.playlist.songs[nextSongIndex]);
        }
    }

    playPreviousSong(): void {
        const prevSongIndex = this.playlist.songs.findIndex((song) => song.title === this.activeSong[0].title
            && song.artist === this.activeSong[0].artist && song.path === this.activeSong[0].path) - 1;
        if (prevSongIndex === -1) {
            this.playSong(this.playlist.songs[this.playlist.songs.length - 1]);
        } else {
            this.playSong(this.playlist.songs[prevSongIndex]);
        }
    }

    setSongDuration(): void {
        const durationInMinutes = this.generateMinutes(this.player.nativeElement.duration);
        const durationInSeconds = this.generateSeconds(this.player.nativeElement.duration);

        if (!isNaN(this.player.nativeElement.duration)) {
            this.durationTime = this.generateTimeToDisplay(durationInMinutes, durationInSeconds);
        }
    }

    generateMinutes(currentTime: number): number {
      return Math.floor(currentTime / 60);
    }

    generateSeconds(currentTime: number): number | string {
        const secsFormula = Math.floor(currentTime % 60);
        return secsFormula < 10 ? '0' + String(secsFormula) : secsFormula;
    }

    generateTimeToDisplay(currentMinutes, currentSeconds): string {
      return `${currentMinutes}:${currentSeconds}`;
    }

    generatePercentage(currentTime: number, duration: number): number {
      return (currentTime / duration) * 100;
    }

    toggleVolume() {
        if(this.isTMuted) {
            this.songVolume = this.tMutedVol;
            this.tMutedVol = 0;
            this.isTMuted = false;
        }
        else {
            this.tMutedVol = this.songVolume;
            this.songVolume = 0;
            this.isTMuted = true;
        }
        this.cdr.detectChanges();
        electron.ipcRenderer.send("send-volume-level", this.songVolume, null);
    }

    getVolumeIcon() {
        if (this.songVolume <= 0) {
            return 'volume_off';
        }
        else if (this.songVolume <=49) {
            return 'volume_down';
        }
        else {
            return 'volume_up';
        }
    }

    removeSongFromPlaylist(song) {
        electron.ipcRenderer.send('remove-from-playlist', song, this.playlist.name);
        if (this.activeSong[0] == song && this.isPlaying && this.playlist.songs.length > 1) {
            this.playNextSong();
        }
        else if (this.activeSong[0] == song && this.isPlaying) {
            this.player.nativeElement.pause();
            this.activeSong[0] == null;
            this.player.nativeElement.src = "";
        }
        let index = this.playlist.songs.indexOf(song);
        if (index > -1) {
            this.playlist.songs.splice(index, 1);
        }
    }

    onPause(event): void {
        this.isPlaying = false;
        this.cdr.detectChanges();
        electron.ipcRenderer.send("send-play-status", this.isPlaying, null);
    }

    onPlay(event): void {
        this.isPlaying = true;
        this.cdr.detectChanges();
        electron.ipcRenderer.send("send-play-status", this.isPlaying, null);
    }
}
