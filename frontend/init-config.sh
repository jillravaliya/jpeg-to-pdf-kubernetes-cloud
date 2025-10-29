#!/bin/sh

# Runtime configuration injector
# This script replaces the config.js file at container startup

cat > /usr/share/nginx/html/config.js << EOF
window.__APP_CONFIG__ = {
  API_URL: '${API_URL:-/api}'
};
EOF

echo "✅ Configuration updated: API_URL=${API_URL:-/api}"
exec nginx -g 'daemon off;'

