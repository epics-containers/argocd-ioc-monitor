#!/bin/bash
set -euo pipefail

# Wipe any credential helpers (including VS Code's auto-injected OAuth helper).
# An empty-string value resets the helper list so only an explicit PAT via
# `gh auth login` + `gh auth setup-git` can authenticate to remotes.
git config --global credential.helper ''

# Install Claude Code CLI
curl -fsSL https://claude.ai/install.sh | bash

# Install just task runner
curl --proto '=https' --tlsv1.2 -sSf https://just.systems/install.sh | bash -s -- --to /usr/local/bin

# Install Node.js 22
apt-get update -y
apt-get install -y --no-install-recommends curl
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y --no-install-recommends nodejs
rm -rf /var/lib/apt/lists/*


# Install npm and Python dependencies
npm install
uv sync --all-extras
pre-commit install --install-hooks
