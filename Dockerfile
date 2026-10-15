# A thin "runner" image: it carries nginx + node + git and a watch script.
# The actual site source is pulled from GitHub at runtime (see entrypoint),
# so day-to-day content changes never require rebuilding this image.
FROM node:22-alpine

RUN apk add --no-cache nginx git bash tini curl \
    && mkdir -p /run/nginx /usr/share/nginx/html /app \
    && rm -f /etc/nginx/http.d/default.conf

COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

WORKDIR /app

# Defaults — override any of these in docker-compose / unraid.
ENV REPO_URL=https://github.com/ggardenhire/portfolio.git \
    REPO_BRANCH=main \
    POLL_INTERVAL=300

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=90s --retries=3 \
  CMD curl -fsS http://localhost/healthz || exit 1

# tini reaps children and forwards signals; the script spawns nginx + sleeps.
ENTRYPOINT ["/sbin/tini", "--", "/usr/local/bin/entrypoint.sh"]
