
# Changelog

## Unreleased


## Released


### *1.1.0* - 2020-07-06

#### Added
- Link metadata property added to songs. This is to store the source of the song, such as a spotify, youtube or other link.
- Touch Portal Integration & Example Pages. Including Twitch Integration Example. *Requires TP 2.2+*
- HTTP Backend API Service.
- New IPC calls for controlling and fetching data for HTTP service and TP plugin.
- New README files for various components and features.
- Auto Update.
- Logging to file. Can be found in *%AppData%\music-mate\logs*

#### Changed

- Song Model now has "Link" property. Retroactively, songs will have this field empty.
- Project Structure to support API server and TP integration plugin
- Tooltip on logo now displays the app version number.
- Auto Update will work from v1.1.0+ for Windows only.

### Fixed
- N/A

### Removed
- Commented code regarding future features such as HTML file output and hardware acceleration.
	- HTML file output will be attempted again.
	- Hardware Acceleration toggle is in the far backlog. Issues were found with order of operations.


### *1.0.0* - 2020-06-21

#### Added
- Tooltips on menu actions, volume slider and player buttons.
- Tooltip on top-left logo for author.
- Help button in menu. Links to README.md in master repository. 
- Toggle for Songs menu to add & remove existing songs to a playlist.
- Menu in Songs menu to delete songs

#### Changed
- Changed progress bar into slider for seeking through songs
- Changed Add Song menu to Songs menu. Primarily for managing songs. See Added.

#### Fixed
- Fetching artist tag from metadata tags on audio files

#### Removed
- N/A 

### *0.1.0-beta* - 2020-06-17

Initial Version
