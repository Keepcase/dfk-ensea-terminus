FROM node:24-alpine

WORKDIR /workspace

# Install useful tools for development
RUN apk add --no-cache git curl

# Expose Vite dev server port
EXPOSE 5173

# Default: keep container alive for interactive use
CMD ["tail", "-f", "/dev/null"]
