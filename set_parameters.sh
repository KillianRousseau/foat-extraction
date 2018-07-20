#!/bin/sh

if [ $# != 2 ];then
    echo "Argument 1 : project id, Argument 2 : string with parameters"
exit 0
else
    # We ensure the project won't be deleted while we work on it
    rm -f "deletable_projects/$1"
    mkdir -p "projects/$1"
    echo " $2" > "projects/$1/parameters"
fi
