FROM nginx:stable

ARG API_VERSION
ARG SUBJECT
ARG RENDERER_PATH=""

COPY nginx.conf /etc/nginx/nginx.conf
COPY ./build-$SUBJECT$RENDERER_PATH/ /usr/share/nginx/html

LABEL apiVersion=$API_VERSION
