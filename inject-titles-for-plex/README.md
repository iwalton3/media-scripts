# Show Subtitle/Audio Names and Media Version Info for Plex

This script allows you to see the subtitle, video, and audio track names embedded in media files within the Plex Web app and Plex Media Player.

Update: It now also shows the file format and codec when you click "Play Version" for multiple file versions. (Excludes optimized versions which already have titles.)

Plex Forum: https://forums.plex.tv/t/552743

## Plex Web

1. To use the tweak with Plex Web, install [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) (Firefox) or [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) (Chrome).
2. Then install the [User Script](https://greasyfork.org/en/scripts/397620-show-subtitle-audio-names-for-plex).

## Plex Media Player

1. Find the install folder for Plex Media Player web client.
    - Windows: `C:\Program Files\Plex\Plex Media Player\web-client\desktop\js`
    - Linux: `/usr/local/share/plexmediaplayer/web-client/desktop/js/`
    - OSX: `/Applications/Plex Media Player.app/Contents/Resources/web-client/desktop/js`
2. Download the [tweak file](https://github.com/iwalton3/media-scripts/blob/master/inject-titles-for-plex/inject-titles-for-plex.js).
3. Append the file to the newest JS bundle named `chunk-2-[hash]-plex-[version].js`.

## Plex Media Player (TV Mode)

1. Find the install folder for Plex Media Player web client.
    - Windows: `C:\Program Files\Plex\Plex Media Player\web-client\tv`
    - Linux: `/usr/local/share/plexmediaplayer/web-client/tv`
    - OSX: `/Applications/Plex Media Player.app/Contents/Resources/web-client/tv`
2. Download the [tweak file](https://github.com/iwalton3/media-scripts/blob/master/inject-titles-for-plex/inject-titles-for-plex.js).
3. Add the contents of the tweak to `index.html` after `window.performance.measure('init:js:eval', 'init:js:eval:start');`.

## Plex Desktop

1. Find the install folder for Plex Media Player web client.
    - Windows: `C:\Program Files\Plex\Plex\web-client\js`
2. Download the [tweak file](https://github.com/iwalton3/media-scripts/blob/master/inject-titles-for-plex/inject-titles-for-plex.js).
3. Append the file to the newest JS bundle named `chunk-1-[hash]-plex-[version].js`.

## Filename Version

If you prefer that the media version selection shows the filename of the media version instead of the codec and file format, you can use this version. The dialog can get a bit crowded if you have long filenames though. (This also includes the subtitle/audio name tweak. Do not install both.)

 - [User Script](https://greasyfork.org/en/scripts/397746-show-subtitle-audio-names-and-media-file-name-for-plex/code)
 - [Tweak File](https://github.com/iwalton3/media-scripts/blob/master/inject-titles-for-plex/inject-titles-and-filenames-for-plex.js)

## Segment Version

This version will only include what is inside { } (or Unknown if there aren't any):
 - [User Script](https://greasyfork.org/en/scripts/398883-show-subtitle-audio-names-and-media-file-segment-for-plex)
 - [Tweak File](https://github.com/iwalton3/media-scripts/blob/master/inject-titles-for-plex/inject-titles-and-segments-for-plex.js)

Please note that this script may break in future versions of Plex. It shouldn't though, as the Plex API that it intercepts and modifies seems to be relatively stable. Please let me know if you have problems.

## Other Players or Entire Plex Server

If you're interested in having these changes affect all the clients for an entire server, including ones that are not compatible with this script, you should check out [Metaproxy](https://forums.plex.tv/t/metaproxy-for-plex/566250). This is a proxy server that implements a similar function to the scripts here.
