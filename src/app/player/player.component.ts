import { Component, Directive, Input, ViewChild, ElementRef, ChangeDetectionStrategy,
            ChangeDetectorRef,    OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { TemplatePortal } from '@angular/cdk/portal';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { MatMenuTrigger} from '@angular/material/menu';
import { BehaviorSubject, Subject, Subscription, fromEvent } from 'rxjs';
import { take, filter } from "rxjs/operators";
import { Song } from '../models/song';
import { Playlist } from '../models/playlist';
const electron = (<any>window).require('electron');

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
  //changeDetection: ChangeDetectionStrategy.OnPush
})

export class PlayerComponent implements OnInit {

    currentProgress$ = new BehaviorSubject(0);
    currentTime$ = new Subject();
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
            }
            else {
                electron.ipcRenderer.send("new-song-update", "");
            }
            this.cdr.detectChanges();
        });

        electron.ipcRenderer.on('update-songs', async(event, newSong, playlistName) => {
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
        electron.ipcRenderer.on("pause", async(event) => {
            this.player.nativeElement.pause();
        });
        electron.ipcRenderer.on("play", async(event) => {
            this.player.nativeElement.play();
        });
        electron.ipcRenderer.on("toggle-pause", async(event) => {
            if (this.isPlaying) {
                this.player.nativeElement.pause();
            }
            else {
                this.player.nativeElement.play();
            }
        });
        electron.ipcRenderer.on("toggle-loop", async(event) => {
            this.toggleLoop = !this.toggleLoop;
        });
        electron.ipcRenderer.on("toggle-mute", async(event) => {
            this.toggleVolume();
        });
        electron.ipcRenderer.on("set-volume", async(event, value) => {
            if(value < 0) {
                value = 0;
            }
            if (value > 100) {
                value = 100;
            }
            this.songVolume = value;
        });
        electron.ipcRenderer.on("modify-volume", async(event, value) => {
            value = this.songVolume + value;
            if(value < 0) {
                value = 0;
            }
            if (value > 100) {
                value = 100;
            }
            this.songVolume = value;
        });
        electron.ipcRenderer.on("shuffle", async(event) => {
            this.shuffleSongs();
        });
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
        this.currentTime$.next(this.generateTimeToDisplay(currentMinutes, currentSeconds));

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
    }

    onPlay(event): void {
        this.isPlaying = true;
        this.cdr.detectChanges();
    }
}
