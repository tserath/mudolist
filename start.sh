#!/bin/sh

# Start the http-server in the background for the frontend
http-server dist -p 5173 --cors &

# Start the backend server with no deprecation warnings
node --no-deprecation src/index.js
