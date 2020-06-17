import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
const electron = (<any>window).require('electron');
import { Song } from '../models/song';
import { Playlist } from '../models/playlist';

@Component({
  selector: 'app-songmodal',
  templateUrl: './songmodal.component.html',
  styleUrls: ['./songmodal.component.scss'],
  //changeDetection: ChangeDetectionStrategy.OnPush
})
export class SongmodalComponent implements OnInit {

    selectedSong: string = "";
    currentPlaylist: Playlist;
    currentPlaylistName: string;
    allPlaylists: Playlist[];
    song: Song = new Song();
    fileChosen: boolean;
    allSongNames: string[] = [];

    constructor(public dialogRef: MatDialogRef<SongmodalComponent>,private cdr: ChangeDetectorRef) {
        this.song.title = "";
        this.song.path = "";
        this.song.artist = "";
        this.fileChosen = false;

        electron.ipcRenderer.on("selected-file", async(event, file, metadata) => {
            if (file) {
                file = file.replace(/\//g,"\\");
                this.song['path'] = file;
                let group = file.split("\\");
                this.selectedSong = group.pop();
                this.fileChosen = true;
                electron.ipcRenderer.send("get-duration", file);
                if (metadata) {
                    if (metadata.hasOwnProperty('title') && metadata.title != null
                        && metadata.title != "" && this.song.title == "") {
                        this.song.title = metadata.title;
                    }
                    if(metadata.hasOwnProperty('artist') && metadata.artist != null
                        && metadata.artist != [] && this.song.artist != "") {
                        this.song.artist = metadata.artist[0];
                    }
                    else if (metadata.hasOwnProperty("albumartist") && metadata.albumartist != null
                        && metadata.albumartist != [] && metadata.albumartist.length > 0) {
                        let artists = metadata.albumartist.join().replace(/,/g,"& ");
                        this.song.artist = artists;
                    }
                }
                this.cdr.detectChanges();
                setTimeout(() => {this.cdr.detectChanges()}, 10);
            }
        });

        electron.ipcRenderer.on("send-duration", async(event, path, duration) => {
            this.song.duration = duration;
        });
        electron.ipcRenderer.on("send-current-playlist-name", async(event, playlist) => {
            this.changePlaylist(playlist);
            this.cdr.detectChanges();
        });

        electron.ipcRenderer.on('send-playlists', async(event, data) => {
            this.allPlaylists = data;
            if (this.allPlaylists.length >= 1) {
                this.changePlaylist(this.allPlaylists[0]);
            }
            this.cdr.detectChanges();
        });

        electron.ipcRenderer.send("get-playlists");
        electron.ipcRenderer.send("get-current-playlist-name");
    }

    ngOnInit(): void {
        this.dialogRef.updatePosition({ top: '30px'});
        this.cdr.detectChanges();
    }

    openFileDialog() {
        electron.ipcRenderer.send("open-file-dialog");
    }

    changePlaylist(playlist) {
        this.currentPlaylist = playlist;
        this.currentPlaylistName = playlist.name;
        this.allSongNames = [];
        if(this.currentPlaylist.songs != null && this.currentPlaylist.songs.length > 0) {
            for(var i of this.currentPlaylist.songs) {
                this.allSongNames.push(i.title);
            }
        }
    }

    isNotCompleted() {
        return (!this.fileChosen || this.song.title == null
            || this.song.title == "" || this.song.path == null ||
            this.song.path == "" || this.allSongNames.includes(this.song.title.trim()));
    }

    addSong() {
        if (this.isNotCompleted()) {
            return;
        }
        this.song.title = this.song.title.trim();
        this.song.artist = this.song.artist.trim();
        electron.ipcRenderer.send("add-to-playlist", this.song, this.currentPlaylist.name);
        electron.ipcRenderer.send("add-new-song", this.song);
    }
}
