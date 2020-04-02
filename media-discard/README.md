# Audio Discard Tool

Plex Forum: https://forums.plex.tv/t/439433

This script allows you to delete unwanted audio tracks not in your language to save space on your Plex server. Extra audio tracks can account for a lot of storage space, with some foreign-language surround sound audio taking up over 10 percent of the file size.

This script will automatically repack your mkv files to remove audio and subtitles that are not in your preferred language. The script defaults to English and Japanese (for anime). Please be warned that this script will *irrevocably delete content* from your library and will cause files to be re-written to disk. Use it wisely.

You need python3 and mkvtoolnix to use this script. The script is intended for Linux, but you may be able to get it to run in cygwin. To adjust the languages to save, change the `permitted_locales` variable.

Example usage:
```
find /path/to/Plex -iname "*.mkv" | while read -r line; do PYTHONUNBUFFERED="yes" media-discard.py "$line" 2>&1 | tee -a /var/log/plex-discard-log; done

```
