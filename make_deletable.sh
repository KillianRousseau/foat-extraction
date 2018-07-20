#!/bin/sh

if [ $# != 1 ];then
    echo "Argument : id of the project that can be removed"
    exit 0
else
    mkdir -p deletable_projects
    echo "" > "deletable_projects/$1"
fi
