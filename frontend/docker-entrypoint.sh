#!/bin/sh

# Create env-config.js from environment variables
echo "window.__ENV__ = {" > /usr/share/nginx/html/env-config.js
echo "  REACT_APP_API_GATEWAY: \"${REACT_APP_API_GATEWAY:-http://localhost:4000}\"" >> /usr/share/nginx/html/env-config.js
echo "};" >> /usr/share/nginx/html/env-config.js

# Execute the passed command (nginx)
exec "$@"
