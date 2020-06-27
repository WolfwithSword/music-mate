const storage = require("electron-json-storage");
var fs = require("fs");

module.exports = function(api, ipcMain, mainWindow){

    var responses = {};

    /** Functions **/
    function makeUUID(){
        return '_' + Math.random().toString(36).substr(2, 9);
    }

    function callIPC(req, res, call) {
        let uuid = makeUUID();
        responses[uuid] = res;
        mainWindow.webContents.send(call, uuid)
    }

    function callIPCValue(req, res, call, value) {
        let uuid = makeUUID();
        responses[uuid] = res;
        mainWindow.webContents.send(call, value, uuid)
    }

    function togglePlay(req, res) {
        callIPC(req, res, "toggle-pause");
    }

    function sendStatus(status, uuid) {
        if(uuid) {
            if(typeof status === "object") {
                responses[uuid].send(JSON.stringify(status, null, 4));
            }
            else {
                responses[uuid].send(status.toString());
            }
            delete responses[uuid];
        }
    }


    /** IPC Main Calls **/
    ipcMain.on("send-play-status", async(event, status, uuid) => {
        sendStatus(status, uuid);
    });

    ipcMain.on("send-loop-status", async(event, status, uuid) => {
        sendStatus(status, uuid);
    });

    ipcMain.on("send-volume-level", async(event, status, uuid) =>{
        sendStatus(status, uuid);
    });

    ipcMain.on("send-playlist-status", async(event, status, uuid) => {
        sendStatus(status, uuid);
    });

    ipcMain.on("send-playlist-name-status", async(event, status, uuid) => {
        sendStatus(status, uuid);
    });

    ipcMain.on("send-song-status", async(event, status, uuid) => {
        sendStatus(status, uuid);
    });

    ipcMain.on("send-song-status-name", async(event, status, uuid) => {
        sendStatus(status, uuid);
    });

    ipcMain.on("send-song-status-duration", async(event, status, uuid) => {
        sendStatus(status, uuid);
    });

    ipcMain.on("send-song-status-artist", async(event, status, uuid) => {
        sendStatus(status, uuid);
    });


    /**  Play **/
    api.get('/play', function(req, res){
        callIPC(req, res, "play");
    });

    api.get('/play/toggle', function(req, res){
        togglePlay(req, res);
    });

    api.get('/play/status', function(req, res){
        callIPC(req, res, "get-play-status");
    });

    api.get('/play/next', function(req, res){
        mainWindow.webContents.send("play-next");
        res.send("OK");
    });

    api.get('/play/prev', function(req, res){
        mainWindow.webContents.send("play-prev");
        res.send("OK");
    });


    /** Pause **/
    api.get('/pause', function(req, res){
        callIPC(req, res, "pause");
    });

    api.get('/pause/toggle', function(req, res){
        togglePlay(req, res);
    });


    /** Toggle **/
    api.get('/toggle/play', function(req, res){
        togglePlay(req, res);
    });

    api.get('/toggle/pause', function(req, res){
        togglePlay(req, res);
    });

    api.get("/toggle/loop", function(req, res){
        callIPC(req, res, "toggle-loop");
    });

    api.get("/toggle/mute", function(req, res){
        callIPC(req, res, "toggle-mute");
    });


    /** Volume **/
    api.get("/volume", function (req, res) {
        callIPC(req, res, "get-volume-level");
    });

    api.get("/volume/up/:amount(\\d+)", function (req, res) {
        callIPCValue(req, res, "modify-volume", req.params.amount);
    });

    api.get("/volume/down/:amount(\\d+)", function (req, res) {
        callIPCValue(req, res, "modify-volume", -req.params.amount);
    });

    /**api.post("/volume/up", amount, function (req, res) {
        callIPCValue(req, res, "modify-volume", amount);
    });

    api.post("/volume/down", amount, function (req, res) {
        callIPCValue(req, res, "modify-volume", -amount);
    });

    api.post("/volume/set", amount, function (req, res) {
        mainWindow.webContents.send("set-volume", amount);
    });**/

    api.get("/volume/:amount(\\d+)", function (req, res) {
        mainWindow.webContents.send("set-volume", req.params.amount);
        res.send(req.params.amount.toString());
    });

    api.get("/volume/set/:amount(\\d+)", function (req, res) {
        mainWindow.webContents.send("set-volume", req.params.amount);
        res.send(req.params.amount.toString());
    });

    api.get("/volume/mute", function(req, res){
        mainWindow.webContents.send("set-volume", 0);
        res.send("0");
    });


    /** Playlist **/
    api.get("/playlist", function (req, res) {
        callIPC(req, res, "get-playlist-status");
    });

    api.get("/playlist/name", function (req, res) {
        callIPC(req, res, "get-playlist-name-status");
    });

    api.get("/playlist/set/:name", function (req, res) {
        callIPCValue(req, res, "swap-to-playlist-name", req.params.name);
    });


    /** Song **/
    api.get("/song", function (req, res) {
        callIPC(req, res, "get-song-status");
    });

    api.get("/song/name", function (req, res) {
        callIPC(req, res, "get-song-status-name");
    });

    api.get("/song/artist", function (req, res) {
        callIPC(req, res, "get-song-status-artist");
    });

    api.get("/song/duration", function (req, res) {
        callIPC(req, res, "get-song-status-duration");
    });


    /** Other **/
    api.get("/loop/status", function (req, res) {
        callIPC(req, res, "get-loop-status");
    });

    api.get("/shuffle", function (req, res) {
        mainWindow.webContents.send("shuffle");
        res.send("OK");
    });

    //make posts later on such that this can be "hot swappable"
    api.get("/custom", function (req, res) {
        let text = fs.readFileSync(storage.getDataPath() + "/custom.txt", "utf8")
        res.send(text);
    });
}