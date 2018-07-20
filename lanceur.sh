#!/bin/sh
#Launch extraction on

if [ $# != 1 ];then
    echo "Argument : project id"
    exit 0
else
    echo "id : $1"
    params=$(head -n 1 projects/$1/parameters)
    rm -f projects/$1/video.xml
    echo "Extraction launched…"
    ../video_segmentation projects/$1/video.*
    echo "Extracted"
    python3 ../xmlgen.py projects/$1/video
    echo "Converted to xml"
    echo "Done"
fi
