#!/bin/sh
set -e

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
