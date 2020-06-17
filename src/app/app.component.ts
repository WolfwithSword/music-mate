import { Component, Directive, Input, ViewChild, ElementRef,
    OnInit, HostBinding, HostListener, ChangeDetectorRef  } from '@angular/core';
const electron = (<any>window).require('electron');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
    title = 'music-mate';

    constructor(private cdr: ChangeDetectorRef){
        electron.ipcRenderer.on("log-me", async(event, msg) => {
            console.log(msg);
        });
    }

    ngOnInit() {
        console.log("Music Mate Started");
        electron.ipcRenderer.send("init");
        electron.ipcRenderer.send("get-playlist","Default");
    }
}
