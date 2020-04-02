# Anime Signs/Songs Subtitle Forcing Script

Plex Forum: https://forums.plex.tv/t/364220

Please Note: A similar function is now available in [Plex-MPV-Shim](https://forums.plex.tv/t/plex-mpv-shim-cast-to-mpv-on-linux-windows/447471), which is my custom client for Plex. It is easier to use than this script and works on both Linux and Windows.

Plex by default does not enable subtitle tracks for signs and songs on dual audio or English dubbed anime unless they are forced when encoding. This script will automatically scan your media files and force these subtitle tracks for you, saving you the hassle. It requires python3 and mkvtoolnix. You can run it over all files like this:

```
find /path/to/Plex/ -iname '*.mkv' | while read -r file; do ./plex-force-signs.py "$file" 2>&1 | tee -a signs.log; done
```
