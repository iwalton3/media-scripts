#!/bin/bash
# Requires imagemagick and mediainfo.
# Usage: detect-static-image.sh FILE

image_ct=5

length=$(mediainfo --Output='General;%Duration%' "$1")
length=$((length/1000-40))

interval=$((length/(image_ct-1)))
tempdir="/tmp/$RANDOM$RANDOM$RANDOM"
mkdir "$tempdir"

for i in $(seq 0 $((image_ct-1)))
do
    ffmpeg -v error -ss $((20+i*interval)) -i "$1" -vframes 1 -q:v 2 -y "$tempdir/ss-$i.jpg"
done

matches=0

for i in $(seq 0 $((image_ct-2)))
do
    cf=$(compare -verbose -metric MSE "$tempdir/ss-$i.jpg" "$tempdir/ss-$((i+1)).jpg" "$tempdir/ssc-$i.jpg" 2>&1 | grep 'all:' | sed 's/.*: \([0-9]*\).*/\1/g')
    if [[ "$cf" -lt 75 && "$cf" != "" ]]
    then
        ((matches++))
    fi
done

if [[ "$matches" == "$((image_ct-1))" ]]
then
    echo "Static Image"$'\t'"$matches"$'\t'"$1"
elif [[ "$matches" == 0 ]]
then
    echo "OK"$'\t'"0"$'\t'"$1"
else
    echo "Matches"$'\t'"$matches"$'\t'"$1"
fi

rm -r "$tempdir"

