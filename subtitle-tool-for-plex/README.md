Please Note: A similar function is now available in [Plex-MPV-Shim](https://forums.plex.tv/t/plex-mpv-shim-cast-to-mpv-on-linux-windows/447471), which is my custom client for Plex. It is easier to use than this script and works on both Linux and Windows.

Plex Forum: https://forums.plex.tv/t/364755

This script allows you to set the subtitle preference on an entire series of anime all at once. If you downloaded the dual audio release and now regret it, you can use this tool to switch to the Japanese-audio version without having to change the settings on each file. The operation may also be reversed. This script is compatible with the [sign subtitle forcing script](https://forums.plex.tv/t/anime-signs-songs-subtitle-forcing-script/364220) I also posted, which forces subtitles for sign and song translations for the English version.

After adding your username, password, and server name to the script, it can be called like this:
```
subtitle-tool.py "Anime Name" subbed
subtitle-tool.py "Anime Name" dubbed
```
You will need plexapi Python 3 library installed. (pip3 install plexapi)
