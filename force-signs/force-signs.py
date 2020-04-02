#!/usr/bin/env python3
import sys
import subprocess
import json

fname = sys.argv[1]

def sign_weight(text):
    if not text:
        return 0
    lower_text = text.lower()
    has_songs = "op/ed" in lower_text or "song" in lower_text or "lyric" in lower_text
    has_signs = "sign" in lower_text                                       
    custom = "[" in lower_text or "(" in lower_text
    vendor = "bd" in lower_text or "retail" in lower_text
    weight = 900

    if not (has_songs or has_signs):
        return 0
    if has_songs:
        weight -= 200
    if has_signs:
        weight -= 300
    if custom:
        weight -= 100
    if vendor:
        weight += 50
    return weight

metadata = json.loads(subprocess.check_output(["mkvmerge","-J",fname]).decode())

is_english = False
sign_track = None
sign_track_weight = 1000
forced_uid = None

for track in metadata["tracks"]:
    props = track["properties"]
    if track["type"] == "audio" and props["language"] == "eng":
        is_english = True
    if track["type"] == "subtitles":
        if props.get("language") == "eng":
            untagged = False
            eng_subs = True
        elif "english" in (props.get("track_name") or "").lower():
            untagged = True
            eng_subs = True
        else:
            untagged = False
            eng_subs = False
        weight = sign_weight(props.get("track_name"))        
        if weight and eng_subs:
            if sign_track_weight > weight:
                sign_track_weight = weight
                sign_track = props["uid"]
        if props["forced_track"]:
            if forced_uid != None:
                print("Fatal error",fname,"Multiple forced tracks!")
                sys.exit(1)
            forced_uid = props["uid"]

if not is_english:
    print("Skipping file",fname,"Not in english!")
    sys.exit(0)

if forced_uid != None and sign_track == forced_uid:
    print("Skipping file",fname,"Already forced.")
    sys.exit(0)

if sign_track == None:
    print("Skipping file",fname,"No sign track.")
    sys.exit(0)

if forced_uid != None:
    print("Remove forced",fname,forced_uid)
    subprocess.Popen(["mkvpropedit",fname,"--edit","track:="+str(forced_uid),"--set","flag-forced=false"])

print("Set forced",fname,sign_track)
subprocess.Popen(["mkvpropedit",fname,"--edit","track:="+str(sign_track),"--set","flag-forced=true"])
