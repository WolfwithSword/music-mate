
# MM-Basic-Example

This page demonstrats most of the basic actions for controlling MusicMate.

<img src="https://imgur.com/uDA0ZrF.png">

# MM-Twitch-Integ-Example

*Requires TP Version 2.2+*

Visually, this is similar to the basic example above with twitch integration and 2 more buttons.

**NOTE**: You will need to configure the "View Song Requests" Button action and events to point to a valid text file.

Additionally, I recommend having both a twitch and a non twitch version of whatever page you use to control MusicMate. This way, you can "disable" certain integration features on the fly, such as skipping songs, previous songs, etc. You could also turn off the channel point redemption too.

The Twitch integration events will *only* work when the TouchPortal page with them is open and active.

### Twitch Integration Examples

Note: This is based on example channel point redemption names. This can all be modified.
So can any messages sent during the events. I recommend keeping a 100ms timer in some so the message content with states will remain in sync.

- Point Redemption: `volume` OR Chat Message equals `~volume`: Returns current volume. This is in the volume level button.
- Point Redemption: `increase volume`: Increases volume by an amount. This is in the volume up button.
- Point Redemption: `decrease volume`: Increases volume by an amount. This is in the volume down button.
- Point Redemption: `toggle mute`: Toggles muted state. This is in the volume mute button.
- Point Redemption: `previous song`: Plays Previous. Found in the play-prev button.
- Point Redemption: `skip song`: Plays Next. Found in the play-next button.
- Chat Message equals `~duration`: Returns song length. Found in the duration label button.
- Point Redemption: `loop song`: Toggles looping of current song. Found in the loop button.
- Chat Message starts with `~loop`: Returns loop status. Found in loop button.
- Point Redemption: `song`: OR Chat Message equals `~song`: Returns the current song information (name, artist, link). Found in "now playing" button.

For Song Requesting by link, view the "View Song Requests" button events and configure a file.
Doing a point redemption for `song request` or chat message starting with `~sr` will append the chat message with the link to a file.
