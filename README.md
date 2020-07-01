


# Music Mate
<img src="https://imgur.com/xq3fT9c.png" height="250" width="250">

Not just another desktop music player.

## Information
Okay, maybe it is, and maybe it doesn't look the best, but this stores the currently active song, song artist, playlist name and other custom information available as text files (and soon more).

Why store this information? Well, I don't know about you but I'm too broke for Spotify premium and such, and in favour of using copyright-free or licensed music that I have saved locally, I wanted to display this vital information on stream in real time.

And why not just use a standard song queue system like media request in StreamElements and limit it to playlists you made, for example? Yeah you can do that. I just wanted something local :)

<img src="https://imgur.com/1tCjP21.png" width="600" height="520">

**Note:** I am not the world's best designer, it'll be worked on I promise

## Use Cases
Click on the following sections to jump to their specific README.
- [OBS](https://github.com/WolfwithSword/music-mate/tree/master/obs)
- [TouchPortal](https://github.com/WolfwithSword/music-mate/tree/master/touchportal)
- [HTTP Service](https://github.com/WolfwithSword/music-mate/tree/master/api)

# IMPORTANT

I didn't sign any of the release binaries because that's way too expensive for my budget at the moment to keep up with. The code is here, you can see it in all it's glory and safety. If Windows doesn't let you install even with security disabled and stuff, you can rebuild it locally I guess.

# Usage

### Adding A Song
Click the **Add Song** button on the top to display the popup. Select a song through the file explorer by clicking the **Choose Song** button. You can enter in the song title and artist, as well as choosing which playlist to add it to.

If the file has metadata for its title and artist, it will be automatically filled in, but still editable.

If the file or title is missing, or a song with the same title already exists in the playlist you are trying to add it to, you will be unable to add it. Select the file and use and modify the title.

<img src="https://imgur.com/blwHL0v.png" width="600" height="520"> <img src="https://imgur.com/xE3MTAz.png" width="600" height="520">

In the **Manage Existing Songs** tab, you can change up the songs in a given playlist from ones already added to the app.

 <img src="https://imgur.com/tr6iBsq.png" width="600" height="520">
 
In the **Delete Song Records** tab, you can permanently delete songs from the app. This will cascade into all playlists as well.

 <img src="https://imgur.com/aYXA6zr.png" width="600" height="520">
 
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
The primary reason I made this app was to output metadata in real-time so I could display it in say, OBS or hook into it with any other software.

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

## TODO Plan & Long-Term Goals
- Features
	- Add Themes
	- Add Import Directory As Playlist
	- Add Edit Song actions
	- Add more user settings, such as retain last played playlist and volume level
	- Cross-fading capability
	- HTML File output (For advanced usage in OBS with custom CSS)
	- Keyboard/Hotkey/Media Button interaction
	- Translation Ready UI Elements
	- Setting to toggle on/off hardware acceleration
	
- Other
	- Actually spend effort to make the design look nice. Logo too.
	- Touch Portal Related Components
		- Create example page with Twitch integration

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

`npm run make:prod:all` Will create absolutely everything.

## Built Using

Node: v12.16.1

NPM: 6.13.4

Angular CLI: 9.1.7

Angular Material: 9.2.4

Electron: 9.0.3

Electron Forge: 6.0.0-beta.51
