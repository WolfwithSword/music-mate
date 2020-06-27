'use strict';
require ('hazardous');
const {
    app,
    BrowserWindow,
    ipcMain,
    dialog
} = require('electron')
if (require('electron-squirrel-startup')) return app.quit();
const url = require("url");
const path = require("path");
var os = require('os');
const storage = require("electron-json-storage");
const { getAudioDurationInSeconds } = require('get-audio-duration');
var fs = require("fs");
var mm = require('musicmetadata');

const express = require("express");
const api = express();
var port = 14585;

module.paths.push(path.resolve(path.join(app.getAppPath(),
    "node_modules/@ffprobe-installer").replace("app.asar", "app.asar.unpacked")));

let mainWindow;

let global_settings = {'padAmt': 8, 'customString': ""};
let currentSong = {'title':"", 'artist': "", 'path':""};
let currentPlaylist = "";

let allValidSongs = [];

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 900,
        height: 780,
        minWidth:900,
        minHeight:780,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        },
        icon: __dirname + "/dist/assets/musicmate_logo_solid_1.ico"
    });

    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, `/dist/index.html`),
            protocol: "file:",
            slashes: true
        }));
    // Open the DevTools.
    //mainWindow.webContents.openDevTools();

    mainWindow.on('closed', function () {
        mainWindow = null
    })

    require("./api-server")(api, ipcMain, mainWindow);
    api.listen(port, () => console.log(`Starting up backend API: Listening at http://localhost:${port}`));

}

function init() {
    storage.get("settings.json", async(error, data) =>{
        if(data == null || data === {} ||
                !Object.keys(data).includes("padAmt") || !Object.keys(data).includes("customString")) {
            data =  {'padAmt': 8, 'customString': ""}
            storage.set("settings.json",data, async(err)=> {
                if (err)
                    throw err;
            });
            global_settings = data;
        }
        else {
            global_settings = data;
        }
    });

    storage.get("playlists", async(error, data) => {
        if (data == null || data === {}
             || !Object.keys(data).includes("Default")) {
            makeNewPlaylist({
                name: "Default",
                songs: [],
                imagePath: ""
            });
        }
    });

    storage.get("songs", async(error, data) =>{
         if (data == null || data === {}) {
            storage.set("songs", {}, async (err)=> {
            if (err)
                throw err;
            })
        }
        let array = [];
        for (var i of Object.keys(data)) {
            // Async Access runs into lockfile error.
            /*fs.access(data[i].path, fs.F_OK, (err) => {
                if(err)
                {
                    console.error(err);
                    return
                }
                array.push(data[i]);
            });*/
            if(fs.existsSync(data[i].path)) {
                array.push(data[i]);
            }
        }
        allValidSongs = array;
    });

    fs.writeFile(storage.getDataPath() + "/custom.txt", "", async (err)=> {
        if (err) {
            throw error;
        }
    });
    fs.writeFile(storage.getDataPath() + "/songtitle.txt", "", async (err)=>{
        if (err) {
            throw error;
        }
    });
    fs.writeFile(storage.getDataPath() + "/songartist.txt", "", async (err)=>{
        if (err) {
            throw error;
        }
    });
    fs.writeFile(storage.getDataPath() + "/songinfo.txt", "", async (err)=> {
        if (err) {
            throw error;
        }
    });
    fs.writeFile(storage.getDataPath() + "/playlistname.txt", "", async (err)=> {
        if (err) {
            throw error;
        }
    });
    // WIP HTML Output. Add setTimeout to refresh
    /*
    fs.writeFile(storage.getDataPath() + "/custom.html", "", async (err)=> {
        if (err) {
            throw error;
        }
    });
    fs.writeFile(storage.getDataPath() + "/songtitle.html", "", async (err)=> {
        if (err) {
            throw error;
        }
    });
    fs.writeFile(storage.getDataPath() + "/songartist.html", "", async (err)=> {
        if (err) {
            throw error;
        }
    });
    fs.writeFile(storage.getDataPath() + "/songinfo.html", "", async (err)=> {
        if (err) {
            throw error;
        }
    });
    fs.writeFile(storage.getDataPath() + "/playlistname.html", "", async (err)=> {
        if (err) {
            throw error;
        }
    });
    */
}

init();

ipcMain.on("init", async(event) => {
    init();
    //console.log(storage.getDataPath());

    mainWindow.webContents.on("new-window", async(event, url) => {
        event.preventDefault();
        require('electron').shell.openExternal(url);
    });
})

ipcMain.on("get-settings", async(event) => {
    mainWindow.webContents.send("send-settings", global_settings);
})

ipcMain.on("update-settings", async(event, settings) => {
    let keys = Object.keys(settings);
    for(var i = 0; i < keys.length; i++) {
        global_settings[keys[i]] = settings[keys[i]];
    }
    storage.set("settings", global_settings, async (err)=> {
        if (err)
            throw err;
    });

    fs.writeFile(storage.getDataPath() + "/custom.txt", customizeString(), async (err)=> {
        if(err) {
            throw error;
        }
    });

});

ipcMain.on("get-file-urls", async(event) => {
    mainWindow.webContents.send("send-file-urls", {
        songName: storage.getDataPath()+"\\songtitle.txt",
        songArtist: storage.getDataPath()+"\\songartist.txt",
        songInfo: storage.getDataPath()+"\\songinfo.txt",
        playlistName: storage.getDataPath()+"\\playlistname.txt",
        custom: storage.getDataPath()+"\\custom.txt",
    });
});

function generateMinutes(time) {
    return Math.floor(time / 60);
}

function generateSeconds(time) {
    const secsFormula = Math.floor(time % 60);
    return secsFormula < 10 ? '0' + String(secsFormula) : secsFormula;
}

function generateTimeToDisplay(minutes, seconds) {
    return `${minutes}:${seconds}`;
}

ipcMain.on("get-duration", async(event, path) => {
    mainWindow.webContents.send("log-me", "getting duration");
    try{
        getAudioDurationInSeconds(path).then(duration => {
            let time = generateTimeToDisplay(generateMinutes(duration), generateSeconds(duration));
            mainWindow.webContents.send("send-duration", path, time);
        }).catch((error) => {
            mainWindow.webContents.send("log-me",error);
        });
    } catch (error) {
        mainWindow.webContents.send("log-me", error);
    }
})

ipcMain.on("add-new-song", async(event, song) => {
    let key = song.path + "|" + song.title + "|" + song.artist;
    storage.get("songs", async (error, data) => {
        data[key] = song;
        storage.set("songs", data, function (error) {
            if (error)
                throw error;
        });
        if (error)
            throw error;
    });
    let exists = false;
    for (var i = 0; i < allValidSongs.length; i++) {
        if (allValidSongs[i].title == song.title && allValidSongs[i].artist == song.artist
            && allValidSongs[i].path == song.path) {
                exists = true;
                break;
        }
    }
    if (!exists) {
        allValidSongs.push(song);
    }
});

ipcMain.on("get-all-songs", async(event) => {
        mainWindow.webContents.send("send-all-songs", allValidSongs);
});

function getPadding() {
    return "".padStart(global_settings.padAmt, " ");
}

function customizeString() {
    if(global_settings == null || !global_settings.hasOwnProperty("customString") ||
        global_settings.customString == null) {
        return "";
    }
    let customStr = global_settings.customString;
    customStr = customStr.replace(/{songname}/g, currentSong.title);
    customStr = customStr.replace(/{songartist}/g, currentSong.artist);
    customStr = customStr.replace(/{playlistname}/g, currentPlaylist);
    customStr = customStr.replace(/{padding}/g, getPadding());
    return customStr;
}

ipcMain.on("new-song-update", async(event, song) => {
    currentSong = song;

    fs.writeFile(storage.getDataPath() + "/songtitle.txt", getPadding() + song.title, async (err)=> {
        if (err) {
            throw errr;
        }
    });

    fs.writeFile(storage.getDataPath() + "/songartist.txt", getPadding() + song.artist, async (err)=> {
        if (err) {
            throw errr;
        }
    });
    fs.writeFile(storage.getDataPath() + "/songinfo.txt", getPadding() + song.title + (song.artist == null || song.artist == "" ? "" : "  |  " + song.artist), async (err)=> {
        if (err) {
            throw errr;
        }
    });
    fs.writeFile(storage.getDataPath() + "/custom.txt", customizeString(), async (err)=> {
        if(err) {
            throw errr;
        }
    });

    /*
    fs.writeFile(storage.getDataPath() + "/songtitle.html", "<div class=\"song-title\">" + song.title + "</div>", async (err)=> {
        if (err) {
            throw error;
        }
    });

    fs.writeFile(storage.getDataPath() + "/songartist.html", "<div class=\"song-artist\">" + song.artist + "</div>", async (err)=> {
        if (err) {
            throw error;
        }
    });
    fs.writeFile(storage.getDataPath() + "/songinfo.html", "<div class=\"song-info\">" +
        "<div class=\"song-title\">" + song.title + "</div><div class=\"song-artist\">" + song.artist + "</div></div>", async (err)=> {
        if (err) {
            throw error;
        }
    });*/
})

ipcMain.on("change-playlist-update", async(event, playlistName) => {
    currentPlaylist = playlistName;
    fs.writeFile(storage.getDataPath() + "/playlistname.txt", getPadding() + playlistName, async (err)=> {
        if (err) {
            throw error;
        }
    });
});

ipcMain.on('get-playlist', async(event, name) => {
    storage.get("playlists", async (error, data) => {
        if (error)
            throw error
        if(data.hasOwnProperty(name)) {
            mainWindow.webContents.send("send-playlist", data[name]);
        }
    })
});

ipcMain.on('get-playlists', async(event) => {
    storage.get("playlists", async (error, data)=> {
        if (error)
            throw error;
        let array = [];
        for (var i of Object.keys(data)) {
            array.push(data[i]);
        }
        mainWindow.webContents.send("send-playlists", array);
    })
});

ipcMain.on('make-playlist', async(event, playlist) => {
    makeNewPlaylist(playlist);
});

function makeNewPlaylist(playlist) {
    storage.get("playlists", function (error, data) {
        if (error)
            throw error;
        data[playlist.name] = {
            "songs": playlist.songs,
            "name": playlist.name,
            "imagePath": playlist.imagePath
        };
        storage.set("playlists", data, function (error) {
            if (error)
                throw error;
        });
        let array = [];
        for (var i of Object.keys(data)) {
            array.push(data[i]);
        }
        mainWindow.webContents.send("send-playlists", array);
    })
}

ipcMain.on('add-to-playlist', async(event, newSong, playlistName) => {

    storage.get("playlists", function (error, data) {
        if (error) {
            throw error;
        }
        let pl = data[playlistName];
        for (var i = 0; i < pl.songs.length; i++) {
            if (pl.songs[i].title == newSong.title && pl.songs[i].path == newSong.path && newSong.artist == pl.songs[i].artist) {
                return;
            }
        }
        data[playlistName].songs.push(newSong);

        storage.set("playlists", data, function (error) {
            if (error)
                throw error;
        })

        mainWindow.webContents.send("update-songs", newSong, playlistName);
    })
});

ipcMain.on("delete-songs", async(event, songs, deleteMissingPaths) => {
    storage.get("songs", function(error, data) {
        if(error) throw error;
        for (var i = 0; i< songs.length; i++) {
            let key = songs[i].path + "|" + songs[i].title + "|" + songs[i].artist;
            delete data[key];
        }
        let keys = Object.keys(data);
        if (deleteMissingPaths) {
            for (var i = 0; i<keys.length; i++){
                if(!fs.existsSync(data[keys[i]].path)) {
                    delete data[keys[i]];
                }
            }
        }
        let array = [];
        for (var i of Object.keys(data)) {
            if(fs.existsSync(data[i].path)) {
                array.push(data[i]);
            }
        }
        storage.set("songs", data, function(error) {
            if (error) throw error;
        });
        allValidSongs = array;

        storage.get("playlists", function(err, data2) {
            for(var name of Object.keys(data2)) {
                for(var song of data2[name].songs) {
                    let key = song.path+"|"+song.title+"|"+song.artist;
                    if(!data.hasOwnProperty(key)) {
                        removeSongFromPlaylist(song, name);
                    }
                }
            }
        });
        mainWindow.webContents.send("send-all-songs");
        mainWindow.webContents.send("update-songs",null, currentPlaylist);
    })
});

ipcMain.on("overwrite-playlist", async(event, playlist) => {
    storage.get("playlists", function(error, data) {
        data[playlist.name] = playlist;
        storage.set("playlists", data, function(error) {
            if (error) throw error;
        });
        mainWindow.webContents.send("send-all-songs");
        mainWindow.webContents.send("update-songs",null, currentPlaylist);
    });
});

function removeSongFromPlaylist(song, playlistName) {
    storage.get("playlists", function (error, data) {
        if (error) {
            throw error;
        }

        var array = data[playlistName]['songs'].filter(function (value, index, arr) {
            return !(value.title == song.title && value.artist == song.artist && value.path == song.path);
        });

        data[playlistName]['songs'] = array;

        storage.set("playlists", data, function (error) {
            if (error)
                throw error;
        })
    })
}

ipcMain.on('remove-from-playlist', async(event, song, playlistName) => {
    removeSongFromPlaylist(song, playlistName);
});

ipcMain.on('remove-playlist', async(event, playlist) => {

    storage.get("playlists", function (error, data) {
        if (error) {
            throw error;
        }

        delete data[playlist.name];

        storage.set("playlists", data, function (error) {
            if (error)
                throw error;
        })
    });
});

ipcMain.on('open-file-dialog', async(event) => {
    dialog.showOpenDialog({
        mainWindow,
        title: "Select a Song",
        multiSelections: false,
        filters: [{
                name: "Songs",
                extensions: ["mp3", "wav", "ogg"]
            }
        ],
        properties: ['openFile'],
        buttonLabel: "Select"
    }).then(files => {
        if (files) {
            let metadata = {};
            var parser = mm(fs.createReadStream(files.filePaths[0]),  (err, md) => {
              if( md ) {
                metadata = md;
              }
               console.log(metadata);
              mainWindow.webContents.send('selected-file', files.filePaths[0], metadata);
            });
        }
    });
})

app.on('ready', createWindow)

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin')
        app.quit()
});

app.on('activate', function () {
    if (mainWindow === null)
        createWindow()
});
