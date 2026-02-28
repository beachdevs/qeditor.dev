# 1. Use an existing image as a base
FROM tsl0922/ttyd:latest

# Image metadata
LABEL org.opencontainers.image.title="qeditor-host"

# 2. Install dependencies and OpenClaw
# Note: Using --no-onboard to prevent interactive wizard during build
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    git \
    sudo \
    unzip \
    python3 \
    build-essential \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://bun.sh/install | bash

# 3. Set the default command (similar to your previous run command)
ENTRYPOINT ["/usr/bin/ttyd"]
CMD ["-W", "bash"]
