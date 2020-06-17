import { Component, OnInit, ChangeDetectionStrategy,
            ChangeDetectorRef } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Playlist } from '../models/playlist';
import { Song } from '../models/song';
const electron = (<any>window).require('electron');

@Component({
  selector: 'app-playlistmodal',
  templateUrl: './playlistmodal.component.html',
  styleUrls: ['./playlistmodal.component.scss'],
})
export class PlaylistmodalComponent implements OnInit {

    playlist: Playlist;
    songs: Song[] = [];
    filteredSongsList: Song[] = [];
    existingPlaylists: Playlist[] = [];
    existingPLNames: string[] = [];

    filterSongTitle: string = "";
    filterSongArtist: string = "";

    constructor(public dialogRef: MatDialogRef<PlaylistmodalComponent>,private cdr: ChangeDetectorRef) {
        this.playlist = new Playlist();
        this.playlist.imagePath = "";
        this.playlist.name = "";
        this.playlist.songs = [];
        electron.ipcRenderer.on("send-all-songs", async(event, songs) => {
                this.songs = songs;
                this.filteredSongsList = this.songs;
                this.filterSongs();
                electron.ipcRenderer.send("get-playlists");
        });

        electron.ipcRenderer.on("send-playlists", async(event, playlists) => {
            this.existingPlaylists = playlists;
            this.existingPLNames = [];
            for (var i of this.existingPlaylists) {
                this.existingPLNames.push(i.name);
            }
            this.cdr.detectChanges();
        });

        electron.ipcRenderer.send("get-all-songs");
    }

    ngOnInit(): void {
        this.dialogRef.updatePosition({ top: '30px'});
        this.cdr.detectChanges();
    }

    filterSongs() {
        this.filteredSongsList = [];
        this.filteredSongsList = this.songs.filter( (elem, index, array) => {
            let filterByTitle = this.filterSongTitle == "" ? false : true;
            let filterByArtist = this.filterSongArtist == "" ? false : true;

            let alreadyChosen = this.playlist.songs.includes(elem);

            let add = true;

            if (add && filterByTitle) {
                add = elem.title.trim().toLowerCase().includes(this.filterSongTitle.trim().toLowerCase());
            }
            if (add && filterByArtist) {
                add = elem.artist.trim().toLowerCase().includes(this.filterSongArtist.trim().toLowerCase());
            }
            return add;
        });
    }

    addPlaylist() {
        if(this.playlist.name == null || this.playlist.name == "") {
            return;
        }
        this.playlist.name = this.playlist.name.trim();
        electron.ipcRenderer.send("make-playlist", this.playlist);
    }

}