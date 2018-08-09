#!/bin/sh
#Downloader from url in folder "id"
if [ $# != 2 ];then
    echo "First argument : project id. Second : id of the file"
    exit 0
else
    mkdir -p "projects/$1"
    echo "" > "projects/$1/parameters"
    filename=`basename "$2"`
    extension="mp4"
    scp "root@foat-backend.irisa.fr:/var/www/foat/bundle/programs/server/assets/app/uploads/videos/$2" "projects/$1/video.$extension"
fi
