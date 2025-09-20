#!/bin/sh
# If a custom config is mounted or present, ensure it's in place.
# For our case it's already baked in, but we can handle a mount.
if [ -f /etc/nginx/nginx.conf ]; then
  echo "Using config at /etc/nginx/nginx.conf"
else
  echo "Config missing, copying default"
  cp /etc/nginx/nginx.conf.default /etc/nginx/nginx.conf
fi

exec "$@"
