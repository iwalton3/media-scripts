#!/bin/bash
i=0
paste <(ls subtitle) <(ls video) | column -ts $'\t'
read -p "Please confirm the numbering is correct. [y/N] " verify
if [[ ! "$verify" =~ [yY] ]]
then
    echo "Aborted!"
    exit 1
fi

paste <(ls subtitle) <(ls video) | while IFS=$'\t' read -r s v
do
    ((i++))
    out="$(sed -e 's/\.[^.]\+$/.mkv/g' <<< "$s")"
    if [[ ! -e "$out" ]]
    then
        if [[ -e "$i.txt" ]]
        then
            rm "CHECKME_$out"
            offset=$(cat "$i.txt")
        else
            ffmpeg -loglevel quiet -nostdin -y -i subtitle/"$s" subtmp.srt < /dev/null
            offset=$(subsync video/"$v" -i subtmp.srt 2>&1 1>/dev/null | grep 'offset seconds' | sed 's/.*: /1000*/g' | bc | sed 's/\..*//g')
            echo "Sync: $offset"
            rm subtmp.srt
            if [[ "${offset#-}" -gt "20000" ]]
            then
                echo "Sync using subtitles failed. Trying audio sync..."
                offset=$(audio-transfer.py -print-offset-only video/"$v" subtitle/"$s")
                echo "Sync: $offset"
                if [[ "${offset#-}" -gt "20000" ]] || [[ "$offset" == "" ]]
                then
                    echo "Sync failure!"
                    echo "Please write $i.txt"
                    echo "$i" >> failed.txt
                    out="CHECKME_$out"
                    offset=0
                fi
            fi
        fi
        mkvmerge -o "$out" -A -D -B -T -y "-1:$offset" subtitle/"$s" video/"$v"
    fi
done
