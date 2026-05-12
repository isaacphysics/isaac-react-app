#!/bin/bash

yarn install --immutable
yarn cypress run --component --browser chrome "$@"
