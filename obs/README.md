# OBS Setup Examples

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

## Metadata Files
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
