FROM nginx:stable

ARG API_VERSION
ARG SUBJECT

COPY ./build-$SUBJECT/ /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80

LABEL apiVersion=$API_VERSION
