# No Cover Fade-In for Plex

This eliminates the fade-in of media covers on Plex, increasing the apparent speed of the application.

Install stylus ([Chrome](https://chrome.google.com/webstore/detail/stylus/clngdbkpkpeebahjckkjfobafhncgmne?hl=en)/[Firefox](https://addons.mozilla.org/en-US/firefox/addon/styl-us/)) and then install [this userstyle](https://userstyles.org/styles/181403/no-cover-fade-in-for-plex).

If you want the modification for the Plex Media Player, follow these instructions:

1. Navigate to the Plex Media Player folder.

    * Windows: `C:\Program Files\Plex\Plex Media Player\web-client\desktop\`
    * Linux: `/usr/local/share/plexmediaplayer/web-client/desktop/`
    * OSX: `/Applications/Plex Media Player.app/Contents/Resources/web-client/desktop/`

2. Open `index.html` in a text editor.
3. Add the following lines before `</body>`:
```html
<style>
div[class*="CrossFadeImage-crossFade"] {
    animation-name: none !important;
}
</style>
```
If you are using the newer Plex Desktop app, the folder is `C:\Program Files\Plex\Plex\web-client\`. The procedure is otherwise identical to the Plex Media Player one.
