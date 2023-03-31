#! /bin/bash

set -e  # Exit on failure

if [ $# -ne 1 ] || ! { [ "$1" = "ada" ] || [ "$1" = "phy" ] || [ "$1" = "both" ]; } ; then
  echo "Delete the test database Docker volumes and recreate them empty."
  echo "Usage: clean-test-db.sh [both|ada|phy]"
  exit 1
fi

if [ "$1" = "phy" ] || [ "$1" = "both" ] ; then
    docker volume rm phy-pg-test && docker volume create phy-pg-test
fi

if [ "$1" = "ada" ] || [ "$1" = "both" ] ; then
    docker volume rm ada-pg-test && docker volume create ada-pg-test
fi
