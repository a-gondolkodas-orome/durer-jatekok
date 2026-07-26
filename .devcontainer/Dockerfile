FROM mcr.microsoft.com/devcontainers/javascript-node:24

# Must stay in sync with the "playwright" version in package.json — a mismatch means
# node_modules/playwright looks for a browser revision that isn't in the image.
ARG PLAYWRIGHT_VERSION=1.61.1

# Shared location so the browsers installed here as root are usable by the `node` user.
# Without this they land in /root/.cache/ms-playwright and are invisible at runtime.
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

RUN npx --yes playwright@${PLAYWRIGHT_VERSION} install --with-deps chromium \
 && chmod -R a+rx /ms-playwright \
 && rm -rf /var/lib/apt/lists/* \
 && npm cache clean --force
