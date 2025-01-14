ARG BUILD_TARGET="build-phy"

FROM node:20.12.0-buster AS builder
ARG BUILD_TARGET
ARG REACT_APP_API_VERSION

RUN mkdir /build
WORKDIR /build

COPY package.json /build
COPY yarn.lock /build
RUN yarn install --frozen-lockfile

COPY . /build
RUN yarn $BUILD_TARGET

FROM nginx:stable
ARG BUILD_TARGET
ARG REACT_APP_API_VERSION

COPY --from=builder /build/$BUILD_TARGET/ /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

LABEL apiVersion=$REACT_APP_API_VERSION