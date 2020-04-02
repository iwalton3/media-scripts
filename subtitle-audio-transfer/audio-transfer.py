#!/usr/bin/env python3
import sys
import subprocess
from align_videos_by_soundtrack.align import SyncDetector, cli_common

remove = []
remove_specified = False
remove_all = False
add = []
add_specified = False
copy_subtitles = False
files = []
print_offset_only = False

for argument in sys.argv[1:]:
    if argument == "-copy-subtitles":
        copy_subtitles = True
    elif argument == "-print-offset-only":
        print_offset_only = True
    elif argument.startswith("-"):
        if argument == "-all":
            remove_all = True
        else:
            remove_specified = True
            remove = argument[1:].split(",")
    elif argument.startswith("+"):
        add_specified = True
        add = argument[1:].split(",")
    else:
        files.append(argument)

if print_offset_only:
    main_src, audio_src = files
    destination = None
else:
    main_src, audio_src, destination = files

cli_common.logger_config()

with SyncDetector() as det:
    result = det.align([audio_src, main_src])

offset = 0
if result[0]["trim"] > 0:
    offset = int(-result[0]["trim"]*1000)
else:
    offset = int(result[0]["pad"]*1000)

arguments = ["mkvmerge","-o",destination,"-D","-B","-T"]
if not copy_subtitles:
    arguments.extend(["-S","-M"])
if add_specified:
    arguments.extend(["-a",",".join(add)])
arguments.extend(["-y", "-1:" + str(offset), audio_src])
if remove_specified:
    arguments.extend(["-a","!"+(",".join(remove))])
elif remove_all:
    arguments.append("-A")
arguments.append(main_src)

if print_offset_only:
    print(offset)
else:
    print("Sync: {0}".format(offset))
    subprocess.check_call(arguments)
