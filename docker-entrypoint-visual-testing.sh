#!/bin/bash

yarn install
# yarn cypress info
yarn cypress run --component --browser chrome
