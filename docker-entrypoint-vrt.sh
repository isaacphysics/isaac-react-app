#!/bin/bash

yarn install --frozen-lockfile
yarn cypress run --component --browser chrome
