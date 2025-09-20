# ---- rtmp/Dockerfile -------------------------------------------------
FROM alfg/nginx-rtmp:latest

# 1️⃣  Remove the default config that the base image ships with
#    (optional but tidy – it prevents accidental fall‑back)
RUN rm -f /etc/nginx/conf.d/default.conf

# 2️⃣  Copy our custom config (the file lives next to this Dockerfile)
COPY nginx.conf /etc/nginx/nginx.conf

# 3️⃣  Copy and use our own entrypoint script
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# 4️⃣  Declare the entrypoint + default command
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]

# 5️⃣  Expose the ports (purely for documentation)
EXPOSE 1935 80
