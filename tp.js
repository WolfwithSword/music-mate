const storage = require("electron-json-storage");
var fs = require("fs");
const net = require("net");

module.exports = function(ipcMain, mainWindow){
    try {

        let pairJSON = {
            "type": "pair",
            "id": "music_mate_14585"
        }
        const socket = new net.Socket()
        let connected = false;

        const directActions = [
            "toggle-play",
            "play", "pause",
            "play-next", "play-prev",
            "toggle-loop", "shuffle",
            "toggle-mute"
        ]

        function callIPC(call) {
            if (connected) {
                if(call == "toggle-play") {
                    call = "toggle-pause";
                }
                mainWindow.webContents.send(call);
            }
        }

        function callIPCValue(call, value) {
            if(connected) {
                mainWindow.webContents.send(call, value);
            }
        }

        console.log("Attempting socket connection to TouchPortal...")
        socket.setEncoding("utf8");
        socket.connect(12136, "127.0.0.1", function () {
        });

        socket.on('connect',  function () {
            console.log("[open] Connection Established to TouchPortal");
            console.log("Pairing...");
            socket.write(JSON.stringify(pairJSON)+"\n");

			/** IPC Main Calls **/
			ipcMain.on("send-play-status", async(event, value) => {
				sendState(value, "is-playing");
			});

			ipcMain.on("send-loop-status", async(event, value) => {
				sendState(value, "is-looping");
			});

			ipcMain.on("send-volume-level", async(event, value) =>{
				sendState(value, "volume-level");
				sendState((value == 0 ? "Muted" : "Unmuted"), "mute-status");
			});

			ipcMain.on("send-playlist-name-status", async(event, value) => {
				sendState(value, "playlist-name");
			});

			ipcMain.on("send-song-status-name", async(event, value) => {
				sendState(value, "song-name");
			});

			ipcMain.on("send-song-status-duration", async(event, value) => {
				sendState(value, "song-duration");
			});

			ipcMain.on("send-song-status-artist", async(event, value) => {
				sendState(value, "song-artist");
			});

			ipcMain.on("send-current-duration", async(event, value) => {
				sendState(value, "current-duration");
			});

            ipcMain.on("send-song-link", async(event, value) => {
				sendState(value, "song-link");
			});
        });

        socket.on("ready", function() {
            /** Override for now until status of pair success is back**/
            setTimeout( () =>{
                console.log("[paired] Successfully paired with TouchPortal");
                connected = true;
                sendState(connected, "connected");
                init();
            }, 1000);

        })

        socket.on('data', function (event) {
            handleMessage(event);
        });

        socket.on('close', function (event) {
            if(event.wasClean) {
                console.log(`[close] Connection closed with TouchPortal. ${event}`);
            }
            connected = false;
        });

        socket.on('error',function (err) {
            console.log(`[error] ${err}`);
        });

        function init() {
            mainWindow.webContents.send("get-play-status");
            mainWindow.webContents.send("get-loop-status");
            mainWindow.webContents.send("get-volume-level");
            mainWindow.webContents.send("get-playlist-name-status");
            mainWindow.webContents.send("get-song-status-name");
            mainWindow.webContents.send("get-song-status-artist");
            mainWindow.webContents.send("get-song-status-duration");
            mainWindow.webContents.send("get-song-link");
            sendState("0:00", "current-duration");
        }

        function sendState(value, id) {
            if (value == null) {
                return;
            }
            let data = {
                "type": "stateUpdate",
                "id": "mm-"+id,
                "value": value.toString()
            };
            if(connected){
                socket.write(JSON.stringify(data) + "\n");
            }
        }


        function handleMessage(event) {
            event = JSON.parse(event);
            if(event.hasOwnProperty("status" && event.status == "paired")) {
                console.log("[paired] Successfully paired with TouchPortal");
                connected = true;
                sendState(connected, "connected");
                init();
                return;
            }
            if (!event.hasOwnProperty("pluginId") ||
                event.pluginId != pairJSON["id"] ) {
                return;
            }

            if(event.hasOwnProperty("type")) {
                switch (event.type) {
                    case "action":
                        handleAction(event);
                        break;
                    case "closePlugin":
                        console.log("[close] Close connection request sent by TouchPortal");
                        break;
                }
            }
        }

        function handleAction(event) {
            let data = event.data;
            let actionId = event.actionId.replace("mm-","");

            if (directActions.includes(actionId)) {
                callIPC(actionId);
            }
            else {
                if (data != null && data.length > 0) {
                    let value = data[0].value;
                    if (value != null) {
                        callIPCValue(actionId, value);
                    }
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
}