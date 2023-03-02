# Detect Static Image

This script requires `ffmpeg`, `mediainfo`, and `imagemagick`.

The script will take 5 images from the media file provided to it and check if they match.
This can be used to detect a variety of things, including "music videos" which are a static
image or other unwanted fake media files.

Example usage:

```bash
find /path/to/media/ -type f \( -iname '*.mkv' -or -iname '*.mp4' -or -iname '*.avi' -or -iname '*.mov' \) | while read -r line; do detect-static-image.sh "$line" | tee -a results.tsv; done
```

The resulting information can be easily browsed as a tab-separated-value file.
