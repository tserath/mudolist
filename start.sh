#!/bin/sh

# Start the http-server in the background for the frontend
http-server dist -p 5173 --cors &

# Start the backend server
node src/index.js
