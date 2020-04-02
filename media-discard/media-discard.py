#!/usr/bin/env python3
import sys
import subprocess
import json
import shutil
import os.path
import os
import random

fname = sys.argv[1]
metadata = json.loads(subprocess.check_output(["mkvmerge","-J",fname]).decode())

permitted_locales = {None, 'und', 'eng', 'jpn', 'mis', 'mul', 'zxx'}
saved_audio_tracks = []
saved_subtitle_tracks = []
has_bad_tracks = False

for track in metadata["tracks"]:
    props = track["properties"]
    if track["type"] == "audio":
        if props["language"] in permitted_locales:
            saved_audio_tracks.append(str(track["id"]))
        else:
            has_bad_tracks = True
            print("Discard audio: #{0} {1} ({2})".format(track["id"], props.get("track_name"), props.get("language")))
    elif track["type"] == "subtitles":
        if props["language"] in permitted_locales:
            saved_subtitle_tracks.append(str(track["id"]))
        else:
            has_bad_tracks = True
            print("Discard subtitle: #{0} {1} ({2})".format(track["id"], props.get("track_name"), props.get("language")))

if has_bad_tracks:
    if len(saved_audio_tracks) == 0:
        print("File {0} would have no audio tracks!".format(fname))
        sys.exit(1)
    tempfile = "_temp_{0}.mkv".format(random.randint(0,1000000))
    options = ["mkvmerge","-o",tempfile,
        "-a",",".join(saved_audio_tracks)]
    if len(saved_subtitle_tracks) == 0:
        options.append("-S")
    else:
        options.extend(["-s", ",".join(saved_subtitle_tracks)])
    options.append(fname)
    subprocess.check_call(options)
    orig_size = os.path.getsize(fname)
    new_size = os.path.getsize(tempfile)
    if orig_size * 0.75 > new_size:
        print("File {0} is too small after conversion.".format(fname))
        os.remove(tempfile)
        sys.exit(1)
    print("Moving file {0}...".format(fname))
    shutil.move(fname, fname+".bak")
    try:
        shutil.move(tempfile, fname)
    except Exception:
        print("File {0} could not be moved.".format(fname))
        shutil.move(fname+".bak", fname)
    if os.path.isfile(fname+".bak"):
        os.remove(fname+".bak")
    print("Size reduced {0} MiB ({1:n}%)".format((orig_size-new_size)//(1024**2), 100-(new_size*100//orig_size)))
else:
    print("File {0} is already minified!".format(fname))
