
# HTTP Backend Server
To enable the HTTP Backend, open the menu settings and click the checkbox to enable the HTTP Backend, then restart MusicMate.

**Note**:  The backend runs on `http://localhost:14585`

Currently, only GET requests are supported.

## Endpoints
### *Play*
#### GET
- /play
	- Sends a request to "play" to MM. Returns true if the app is now playing.
- /play/toggle
	- Toggles between Play/Pause. Returns the playing state. True for playing, false for paused.
- /play/status
	- Returns the playing state. True for playing, false for paused.
- /play/next
	- Sends a request to play the next song in the queue. Returns "OK".
- /play/prev
	- Sends a request to play the previous song in the queue. Returns "OK".

### *Pause*
#### GET
- /pause
	- Sends a request to "pause" to MM. Returns false if the app is now paused.
- /pause/toggle
	- Toggles between Play/Pause. Returns the playing state. True for playing, false for paused.

### *Toggle*
#### GET
- /toggle/play
	- Toggles between Play/Pause. Returns the playing state. True for playing, false for paused.
- /toggle/pause
	- Toggles between Play/Pause. Returns the playing state. True for playing, false for paused.
- /toggle/loop
	- Toggles between Looping of the current song. Returns the looping state. True for looping, false for queue based.
- /toggle/mute
	- Toggles muting of the app. Returns the mute state. True for muted, false for unmuted. If unmuted, the previous volume will be restored.

### *Volume*
#### GET
- /volume
	- Get the current volume level (0-100).
- /volume/up/:amount(\\d+)
	- Parameters:
		- amount: number
	- Increase the volume to a max of 100 by the given amount. Only accepts numbers.
- /volume/down/:amount(\\d+)
	- Parameters:
		- amount: number
	- Decrease the volume to a min of 0 by the given amount. Only accepts numbers.
- /volume/:value(\\d+)
	- Parameters:
		- value: number
	- Set the volume to the given value, with a min of 0 or a max of 100. Only accepts numbers.
- /volume/set/:value(\\d+)
	- Parameters:
		- value: number
	- Set the volume to the given value, with a min of 0 or a max of 100. Only accepts numbers.
- /volume/mute
	- Set the volume to 0. This is not the same as toggling mute.

### *Playlist*
#### GET
- /playlist
	- Returns the current playlist as a json object.
- /playlist/name
	- Returns the current playlist's name
- /playlist/set/:name
	- Parameters:
		- name: string
	- Swaps to the playlist name provided, if it exists. Returns the new playlist or current if the new did not exist.

### *Song*
#### GET
- /song
	- Returns the current song as a json object
- /song/name
	- Returns the current song's name/title.
- /song/artist
	- Returns the current song's artist if set.
- /song/duration
	- Returns the current song's length/duration
- /song/link
	- Returns the source link of the song if set.

### *Other*
#### GET
- /loop/status
	- Returns the current looping status. True if looping, false if queue based/normal.
- /shuffle
	- Shuffles the current playlist's queue. Returns "OK"
- /custom
	- Returns the configured content of the custom-string as can be configured in the metadata settings of the app.

## Data Objects
### Song
```
{
	title: "string",
	path: "string",
	artist: "string",
	duration: "string",
	link: "string"
}
```
### Playlist

```
{
	name: "string",
	imagePath: "",   // Not currently used. Always empty string
	songs: song[]
}
```