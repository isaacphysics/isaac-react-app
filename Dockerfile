FROM nginx:stable

ARG API_VERSION
ARG SUBJECT

COPY nginx.conf /etc/nginx/nginx.conf
COPY ./build-$SUBJECT/ /usr/share/nginx/html

LABEL apiVersion=$API_VERSION
