#!/bin/bash

UPDATE=1

set -e && cd "${0%/*}"
killall -w npm node || : # We rlly should make a docker container lol

> server/.env ; > client/.env

cat <<EOF | while IFS= read -r line; do

S weather_api_key=
S weather_api_url=
S MDB_USER=
S MDB_PASS=
S session_secret=
S EMAIL_HOST=
S EMAIL_PORT=
S EMAIL_USER=
S EMAIL_PASS=
C VITE_MAP_BOX_KEY=

EOF
  if   [[ $line == S* ]]; then echo "${line:2}" >> server/.env
  elif [[ $line == C* ]]; then echo "${line:2}" >> client/.env
  fi
done

if [ "$UPDATE" ]; then
    cd server ; npm install --force ; cd -
    cd client ; npm install --force ; cd -
fi

tmux kill-session -t gatemate_sesh && sleep 0.1 || :

tmux new-session -d -s gatemate_sesh
tmux rename-window -t gatemate_sesh:0 'Server'
tmux send-keys -t gatemate_sesh:0   'cd server ; npm start'   C-m
tmux split-window -h -t gatemate_sesh
tmux send-keys -t gatemate_sesh:0.1 'cd client ; npm run dev' C-m

tmux attach-session -t gatemate_sesh