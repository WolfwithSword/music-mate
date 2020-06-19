
# Music Mate
<img src="https://imgur.com/xq3fT9c.png" height="250" width="250">

Not just another desktop music player.

## Information
Okay, maybe it is, and maybe it doesn't look the best, but this stores the currently active song, song artist, playlist name and other custom information available as text files (and soon more).

Why store this information? Well, I don't know about you but I'm too broke for Spotify premium and such, and in favour of using copyright-free or licensed music that I have saved locally, I wanted to display this vital information on stream in real time.

And why not just use a standard song queue system like media request in StreamElements and limit it to playlists you made, for example? Yeah you can do that. I just wanted something local :)

<img src="https://imgur.com/NxyxjWH.png" width="600" height="520">
**Note:** I am not the world's best designer, it'll be worked on I promise

# IMPORTANT

I didn't sign any of the release binaries because that's way too expensive for my budget at the moment to keep up with. The code is here, you can see it in all it's glory and safety. If Windows doesn't let you install even with security disabled and stuff, you can rebuild it locally I guess.

# Usage

### Adding A Song
Click the **Add Song** button on the top to display the popup. Select a song through the file explorer by clicking the **Choose Song** button. You can enter in the song title and artist, as well as choosing which playlist to add it to.

If the file has metadata for its title and artist, it will be automatically filled in, but still editable.

If the file or title is missing, or a song with the same title already exists in the playlist you are trying to add it to, you will be unable to add it. Select the file and use and modify the title.

<img src="https://imgur.com/9fzkiGn.png" width="600" height="520"> <img src="https://imgur.com/oHYfvkl.png" width="600" height="520">

### Creating New Playlist & Switching Playlists
Click the **New Playlist** button to open the dialog for creating a new playlist.

Enter in a unique name for the playlist and hit Create. You can additionally pre-add any songs you've already added through the application as long as their file path is valid. To ease this list, as it can get long, there is a filter for song title or song artist.

To switch playlists, open the playlist selector on the top left.

<img src="https://imgur.com/7RtgVpz.gif" width="600" height="520">

### Removing Songs From Playlist & Deleting Playlists
To remove a song from a playlist, set that playlist active and **right click** on any song in the playlist queue and click remove.

To delete a playlist entirely, open the playlist selected and **right click** any playlist and select delete. You cannot delete the Default playlist.

### Player Actions
This is a generic audio player, really. Doesn't have all the bells and whistles but you can do the following:
- Change Volume with a slider. You can also click the icon to mute or restore to pre-mute volumes.
- Skip ahead or skip backward through the playlist.
- Pause/Play songs with the play button. You can also play songs by clicking them in the playlist (or selecting Play in their context menu).
- Loop a specific song with the loop icon.
- Shuffle the playlist with the far-right shuffle icon.

### Metadata Files
The primary reason I made this app was to output metadata in real-time so I could display it in say, OBS or hook into it with any other software. While I have yet to do a server backend for HTTP stuff, or make plugins for TouchPortal, or output to HTML Files... [See TODO](#TODO-Plan-&-Long-Term-Goals)

It does output to TXT Files, including one configurable file.

The padding value at the top indicates how many spaces the `padding` variable consists of. This is prefixed to each non-custom text file for ease of life usage with OBS.

Each file URL can be copied by clicking the copy icon in each section, and each section indicates what value you are getting back.

<img src="https://imgur.com/H33Mre7.png" width="600" height="520">

The custom file can use the following variables to create a custom message. Any text is permitted here, but the variables indicated below will be replaced by their real-data counterpart.

| Variable       | Value          |
|----------------|----------------|
| {songname}     | Song Name      |
| {songartist}   | Song Artist    |
| {playlistname} | Playlist Name  |
| {padding}      | Padding Amount |

<img src="https://imgur.com/oKTm1pX.png" width="600" height="520">

## Using MetaData Files In OBS
To use the metadata files, first copy one of them by clicking the copy icon in the metadata settings menu.

- In OBS, add a new source **Text (GDI+)**
- Set any font you wish.
- Tick **Read From File** and put in the file URL you copied earlier
- Set the colour, opacity, gradient settings or other to any you wish.
- *Custom Text Extents warning*: If you know what you are doing, you may customize this as well. However, in confjunction with the padding and using scrolling text filters, it may look... interesting...

You can edit this information again by right clicking the source and selecting **Properties**,

In the preview window, move the text source anywhere you'd like and size it accordingly.

### Add Custom Filters
Right click the Text source you created, select **Filters**
#### Scrolling Text:
- Add a new filter **Scroll**
	- Suggested settings:
		- Horizontal Speed: I like 130, but choose whichever you wish
		- Vertical Speed: 0, unless you want it to go up/down. If in the **Properties** you chose vertical, then this makes sense.
		- Limit Width: Checked
		- Width: 5000
		- Limit Height: Unchecked (Unless you know what you're doing with vertical stuff)
		- Loop: Checked
	- **Note**: The **padding** variable and Custom String data in Music Mate are useful especially so for the scrolling filter, so there is "padding" in between sections. Additionally, the spaces must go in the front for the non-custom values, for it to scroll nicely with minimal duplication.

- Add a new filter **Crop/Pad**
	- If anything looks wonky in the preview, you can modify the padding and cropping here.
		- Values which work for me (but not necessarily everyone):
			- Relative: Checked
			- Left: -50, Top: -20, Right: -50, Bottom: -20
- Add a new filter **Render Delay**
	- Set this to 0ms. The "real time" nature of the app will be off by about as low as 150ms and as high as 1.2s (for me, usually on the lower side, and poorly timed with a stopwatch...), so reducing display delay will make it feel more "seamless".
	- If you want it more delayed, go ham!
#### Other filters: 
If you know what you're doing, you can go ham with any other filters. In the future I plan to add html output as well, and will have a section for that with custom CSS settings as examples.

## TODO Plan & Long-Term Goals
- Features
	- Add HELP menu button
	- Add Themes
	- Add Import Directory As Playlist
	- Add more user settings, such as retain last played playlist and volume level
	- Crossfading capability
	- HTML File output (For advanced usage in OBS with custom CSS)
	- Allow deleting from the master song list (not to be confused with the Default playlist)
	- Track Seeking
	- Keyboard/Hotkey/Media Button interaction
	- Auto Update
	- Translation Ready UI Elements
	- Store version number in UI app somewhere (and automate in build process)
	
- Other
	- Actually spend effort to make the design look nice. Logo too.
	- Local backend server to serve HTTP Get & Post requests to expand interaction options
		- IPC Calls are setup, but no backend server. Change volume, manage playlist, swap playlist, get info etc.
	- Touch Portal Plugin & Integration
		- Support getting metadata for currently playing information
		- Support basic player actions
		- Create example page for plugin
		- Create example page with Twitch integration
			- Channel points examples to skip songs, change volume, etc.
			- Send message in chat with press of button song information
			- Event: Auto send message?

## Build from Source
### Dependencies 
You will need the latest version of Node and NPM installed. The latest Angular CLI is a nice-to-have, and you will need electron-forge installed globally.

Download or clone the source and run `npm install` to download all dependencies.
### Build
`npm run build`
### Running Locally
`npm run start`
or
`npm run start:build` if you want to build and run immediately.
### Create Binaries
`npm run make` Will create both the executable and create a Windows installer, both in the `out` directory.

## Built Using

Node: v12.16.1

NPM: 6.13.4

Angular CLI: 9.1.7

Angular Material: 9.2.4

Electron: 9.0.3

Electron Forge: 6.0.0-beta.51
