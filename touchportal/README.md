# TouchPortal Plugin Integration
To enable the TouchPortal integration, open the menu settings and click the checkbox to enable the TouchPortal Integration, then restart MusicMate.

**Note**:  Open TouchPortal before MusicMate, or restart MusicMate after TP is opened, otherwise the integration will not pair.

## Actions/Buttons
- Toggle Play/Pause
- Play
- Pause
- Play Next
- Play Previous
- Toggle Loop
- Shuffle
- Toggle Mute
- Increase Volume
	- Increase the volume by a specified amount.
- Decrease Volume
	- Decrease the volume by a specified amount.
- Set Volume
	- Sets volume to the specified value (0-100).
- Change Playlist
	- Case Sensitive match to a playlist name. If it doesn't exist, does nothing.

## Events

- When a song starts or stops playing
	- Fires whenever a song is paused or unpaused/played. AKA Playing Status is changed.
- When a song starts or stops looping
	- Whenever loop is toggled on or off
- When the volume is muted or unmuted.
	- Whenever volume changes to and from 0

## States/Variables

- Connected: ${mm-connected}
	- Is TP connected to MM?
- Is Playing: ${mm-is-playing}
- Is Looping: ${mm-is-looping}
- Mute Status: ${mm-mute-status}
- Volume Level: ${mm-volume-level}
- Current Duration Progress: ${mm-current-duration}
- Playlist Name: ${mm-playlist-name}
- Song Link: ${mm-song-link}
	- The current song link
- Song Name: ${mm-song-name}
- Song Artist: ${mm-song-artist}
- Song Length/Duration: ${mm-song-duration}

## Examples

### Example Pages
TODO

### Example Twitch Pages
TODO
