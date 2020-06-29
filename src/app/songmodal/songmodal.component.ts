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

    states:string[] = ["AddNewSong","AddSongs", "DeleteSongs"];
    state:number = 0;
    deleteMissing:boolean = false;
    selectedSong: string = "";
    currentPlaylist: Playlist;
    currentPlaylistName: string;
    allPlaylists: Playlist[];
    song: Song = new Song();
    fileChosen: boolean;
    allSongNames: string[] = [];

    filteredSongsList: Song[] = [];
    filterSongArtist: string = "";
    filterSongTitle: string = "";

    songs: Song[] = [];
    selectedSongs: Song[] = [];

    constructor(public dialogRef: MatDialogRef<SongmodalComponent>,private cdr: ChangeDetectorRef) {
        this.song.title = "";
        this.song.path = "";
        this.song.artist = "";
        this.song.link = "";
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
                        && metadata.title != "") {
                        this.song.title = metadata.title;
                    }
                    if(metadata.hasOwnProperty('artist') && metadata.artist != null
                        && metadata.artist != []) {
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
        electron.ipcRenderer.on("send-all-songs", async(event, songs) => {
                this.songs = songs;
                this.filteredSongsList = this.songs;
                this.filterSongs();
        });
    }

    ngOnInit(): void {
        this.dialogRef.updatePosition({ top: '30px'});
        this.cdr.detectChanges();

        electron.ipcRenderer.send("get-playlists");
        electron.ipcRenderer.send("get-current-playlist-name");
    }

    switchStates() {
        this.songs = [];
        this.filteredSongsList = [];
        this.selectedSongs = [];
        this.filterSongArtist = "";
        this.filterSongTitle = "";
        if (this.state == 0) {
            electron.ipcRenderer.send("get-playlists");
            electron.ipcRenderer.send("get-current-playlist-name");
        }
        else if (this.state == 1) {
            electron.ipcRenderer.send("get-playlists");
            electron.ipcRenderer.send("get-current-playlist-name");
            electron.ipcRenderer.send("get-all-songs");
        }
        else if (this.state == 2) {
            electron.ipcRenderer.send("get-all-songs");
        }
    }

    checkContains(songList, song) {
        for (var i = 0; i < songList.length; i++) {
            let s = songList[i];
            if(song.title == s.title && song.path == s.path && song.artist == s.artist) {
                return true;
            }
        }
        return false;
    }

    toggleInSongList(song) {
        if(this.checkContains(this.currentPlaylist.songs, song)) {
            this.currentPlaylist.songs = this.currentPlaylist.songs.filter( (s) => {
                if(song.title == s.title && song.path == s.path && song.artist == s.artist) {
                    return false;
                }
                else {
                    return true;
                }
            });
        }
        else {
            this.currentPlaylist.songs.push(song);
        }
        console.log(song);
        console.log(this.currentPlaylist);
    }

    filterSongs() {
        this.filteredSongsList = [];
        if(this.songs == null) { return;}
        this.filteredSongsList = this.songs.filter( (elem, index, array) => {
            let filterByTitle = this.filterSongTitle == "" ? false : true;
            let filterByArtist = this.filterSongArtist == "" ? false : true;

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
        if (this.states[this.state] == 'AddNewSong'){
            return (!this.fileChosen || this.song.title == null
                || this.song.title == "" || this.song.path == null ||
                this.song.path == "" || this.allSongNames.includes(this.song.title.trim()));
        }
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

     setSongs() {
         electron.ipcRenderer.send("overwrite-playlist", this.currentPlaylist);
    }

    deleteSongs() {
        electron.ipcRenderer.send("delete-songs", this.selectedSongs, this.deleteMissing);
    }


}
