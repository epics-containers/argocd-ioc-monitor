# Installation

## Development with Dev Containers

The easiest way to get started is using a [Dev Container](https://containers.dev/).

### Prerequisites

- [Docker](https://www.docker.com/get-started/) installed and running
- [VS Code](https://code.visualstudio.com/) with the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

### Steps

1. Clone the repository and open it in VS Code.
2. VS Code will prompt **"Reopen in Container"** — click it.
3. Wait for the container to build and `npm install` to finish.
4. Copy `.env.example` to `.env` and fill in the required values:

   ```bash
   cp .env.example .env
   ```

5. Start the dev server:

   ```bash
   npm run dev
   ```

6. The app is available at `http://localhost:5173`.

## Production Deployment

See the Helm chart in `helm/argocd-ioc-monitor/` for Kubernetes deployment.

```bash
helm install ioc-monitor helm/argocd-ioc-monitor \
  --set argocd.url=https://argocd.diamond.ac.uk \
  --set ingress.enabled=true \
  --set ingress.host=ioc-monitor.diamond.ac.uk
```
