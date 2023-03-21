#!/usr/bin/env bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

cd ./src-frontend
if [ ! -d "node_modules" ]; then
    npm install
fi

exec npm run start
