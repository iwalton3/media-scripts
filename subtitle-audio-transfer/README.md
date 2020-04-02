# Automatic Subtitle and Audio Transfer/Sync Scripts

Plex Forum: https://forums.plex.tv/t/441383

Sometimes you need to transfer subtitle and audio tracks between different files. Merging the videos to contain the desired tracks is usually error-prone, as the tracks are not usually synced and even a sync error of less than a second can render the video unwatchable.

These scripts automatically process video files and sync the subtitle or audio tracks, using the sync parameters in the mkv video format. They are great for adding subtitles to raw anime releases when there are not comparable subtitled versions. The subtitle sync uses the audio sync script as a fallback, so you should install both even if you do not plan to transfer audio tracks.

You'll need a copy of mkvtoolnix and python3 for these scripts to work. I suggest using cygwin or WSL to run the scripts if you are not running Linux. The sync work is done by [subsync](https://github.com/smacke/subsync) and [align-videos-by-sound](https://github.com/jeorgen/align-videos-by-sound), which should be installed with the following commands:
```bash
sudo pip3 install git+https://github.com/smacke/subsync
sudo pip3 install git+https://github.com/jeorgen/align-videos-by-sound
```

## Subtitle Verison (`subtitle-transfer.sh`)

The subtitle sync script processes files in the `subtitle` and `video` folder. The files in the subtitle folder can be videos with the desired subtitles, or raw subtitle files. Note that the fallback mode for subtitle sync using the audio tracks will not work with raw subtitle files. The script is fairly fast at processing, and has error handling that will by default not tolerate sync errors over 20 seconds. (You can change that in the script if you have something with a higher margin of error.)

## Audio Verison (`audio-transfer.py`)

The audio subtitle sync script is much slower, but it is precise enough to sync audio files in most cases. Checking the result before replacing your files is highly encouraged. The script does not have a fallback mode, so I suggest checking to make sure the sync settings are reasonable on all the videos. The usage of this script is more complicated, as audio tracks do use more space, and removal of unwanted audio tracks may be desired. The usage is: `audio-transfer.py [-copy-subtitles] [+lang,] [-all|-lang,] main_src audio_src destination` (Eg: `+eng,jpn` adds audio from audio_src. `-jpn` removes audio from main_src. `-all` removes all audio from `main_src`.) An example usage would be to copy all English audio tracks from `audio` folder into tracks from `video` folder, using names from `audio` folder:

```bash
paste <(ls audio) <(ls video) | while IFS=$'\t' read -r a v; do audio-transfer.py +eng video/"$v" audio/"$a" "$(sed 's/\.[^.]\+$/.mkv/g' <<< "$a")" < /dev/null; done
```
