#!/bin/sh

for filename in `ls deletable_projects`
do
    rm -rf "projects/$filename"
done
# Vider la liste des projets "supprimables"
rm -f "deletable_projects"/*
