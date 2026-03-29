#!/bin/sh
set -e

# If the config is already mounted (e.g. by Helm ConfigMap), skip envsubst
if [ ! -w /etc/nginx/conf.d/default.conf ] 2>/dev/null; then
    exec nginx -g 'daemon off;'
fi

# Default to Diamond's ArgoCD instance
ARGOCD_URL="${ARGOCD_URL:-https://argocd.diamond.ac.uk}"
# Strip protocol to get hostname for Host header
ARGOCD_HOST="${ARGOCD_URL#https://}"
ARGOCD_HOST="${ARGOCD_HOST#http://}"

export ARGOCD_URL ARGOCD_HOST

# Substitute only our variables (not nginx's own $variables)
envsubst '${ARGOCD_URL} ${ARGOCD_HOST}' \
  < /etc/nginx/templates/default.conf.template \
  > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'
