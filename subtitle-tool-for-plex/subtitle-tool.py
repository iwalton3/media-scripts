#!/usr/bin/env python3
from plexapi.myplex import MyPlexAccount
import sys
account = MyPlexAccount('USERNAME', 'PASSWORD')

print("Connecting...")
plex = account.resource('SERVERNAME').connect()

shows = None
for library in plex.library.sections():
    if library.type == "show":
        if shows == None:
            shows = library
        else:
            print("Multiple show libraries. Please hardcode it with plex.library.sectionByID.")
            sys.exit(1)

if len(sys.argv) < 2:
    print("Usage: [series] [subbed/dubbed]")
    sys.exit(1)

series = sys.argv[1]
mode = sys.argv[2]

search = shows.search(series)

if len(search) == 1:
    show = search[0]
elif len(search) == 0:
    print("No show found.")
    sys.exit(1)
else:
    for i, show in enumerate(search):
        print("%s: %s" % (i, show.title))
    index = int(input("# "))
    show = search[index]

def check_subtitles_full(subtitles, retry_flag=False):
    for subtitle in subtitles:
        if subtitle.languageCode != "eng":
            continue
        title = (subtitle.title or "").lower()
        if "sign" in title or "commentary" in title:
            continue
        if "Forced" in subtitle._data.get("displayTitle"):
            continue
        return subtitle
    return None

def check_subtitles_forced(subtitles):
    selected_subtitles = None
    for subtitle in subtitles:
        if subtitle.languageCode != "eng":
            continue
        if not "Forced" in subtitle._data.get("displayTitle"):
            continue
        return subtitle
    return None

def process_media(part, debug_name, mode):
    is_english = False
    english_audio = None
    japanese_audio = None
    for audio in part.audioStreams():
        if audio.languageCode == "eng" and english_audio == None:
            is_english = True
            english_audio = audio
        elif audio.languageCode == "jpn" and japanese_audio == None:
            japanese_audio = audio
    if not is_english:
        print("Skipping: %s is not in English." % debug_name)
        return

    if mode == "dubbed":
        subtitles = check_subtitles_forced(part.subtitleStreams())
        if subtitles != None:
            sid = subtitles.id
        else:
            sid = 0
        print("Set dubbed: %s" % debug_name)
        plex.query('/library/parts/%s?audioStreamID=%s&allParts=1' % (part.id, english_audio.id),method=plex._session.put)
        plex.query('/library/parts/%s?subtitleStreamID=%s&allParts=1' % (part.id, sid),method=plex._session.put)
    elif mode == "subbed":
        if japanese_audio == None:
            print("Skipping: %s is English only." % debug_name)
            return
        subtitles = check_subtitles_full(part.subtitleStreams())
        if subtitles == None:
            print("Skipping: %s has no subtitles." % debug_name)
            return
        sid = subtitles.id
        print("Set subbed: %s (%s)" % (debug_name,subtitles.title))
        plex.query('/library/parts/%s?audioStreamID=%s&allParts=1' % (part.id, japanese_audio.id),method=plex._session.put)
        plex.query('/library/parts/%s?subtitleStreamID=%s&allParts=1' % (part.id, sid),method=plex._session.put)


for season in show.seasons():
    for episode in season.episodes():
        debug_name = "S%02iE%02i" % (season.index, episode.index)
        episode = episode.reload()
        medias = episode.media
        if len(medias) > 1:
            print("Warning: %s has multiple media files." % debug_name)
        for media in medias:
            parts = media.parts
            if len(parts) > 1:
                print("Warning: %s has multiple media parts." % debug_name)
            for part in parts:
                process_media(part, debug_name, mode)
