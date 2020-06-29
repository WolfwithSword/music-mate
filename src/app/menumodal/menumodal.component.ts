import { Component, OnInit, ChangeDetectionStrategy,
            ChangeDetectorRef, } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
const electron = (<any>window).require('electron');

@Component({
  selector: 'app-menumodal',
  templateUrl: './menumodal.component.html',
  styleUrls: ['./menumodal.component.scss'],
})
export class MenumodalComponent implements OnInit {

    urls: any = {
        songName: "",
        songArtist: "",
        songInfo: "",
        playlistName: "",
        custom: ""
    }

    variables: any = {
        "songname":"Song Name",
        "songartist":"Song Artist",
        "playlistname":"Playlist Name",
        "padding": "Padding Amount"
    }

    Object = Object;

    settings = {
        padAmt: 8,
        customString: "",
        enableHTTP: false,
        enableTP: false,
    }

    constructor(public dialogRef: MatDialogRef<MenumodalComponent>, private cdr: ChangeDetectorRef) {

        electron.ipcRenderer.on("send-file-urls", async(event, urls) => {
            this.urls = urls;
        });

        electron.ipcRenderer.on("send-settings", async(event, settings) => {
            this.settings = settings;
            this.cdr.detectChanges();
        });

        electron.ipcRenderer.send("get-file-urls");
        electron.ipcRenderer.send("get-settings");
    }

    updateSettings() {
        if(this.settings.padAmt == null) {
            this.settings.padAmt = 0;
        }
        if(this.settings.customString == null) {
            this.settings.customString = "";
        }
        electron.ipcRenderer.send("update-settings", this.settings);
    }

    copyURL(key: string) {
        return this.urls[key];
    }

    ngOnInit(): void {
        this.dialogRef.updatePosition({ top: '30px'});
        this.cdr.detectChanges();
    }
}
