#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

mkdir -p "$DIR/static"
mkdir -p "$DIR/static/js"
wget -O "$DIR/static/js/bootstrap.bundle.min.js" "https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/js/bootstrap.bundle.min.js"
wget -O "$DIR/static/js/jquery-3.5.1.slim.min.js" "https://code.jquery.com/jquery-3.5.1.slim.min.js"

mkdir -p "$DIR/static/css"
wget -O "$DIR/static/css/bootstrap.min.css" "https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css"