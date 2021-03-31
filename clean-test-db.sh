#! /bin/bash

set -e  # Exit on failure

if [ $# -ne 1 ] || ! { [ "$1" = "cs" ] || [ "$1" = "phy" ] || [ "$1" = "both" ]; } ; then
  echo "Delete the test database Docker volumes and recreate them empty."
  echo "Usage: clean-test-db.sh [both|cs|phy]"
  exit 1
fi

if [ "$1" = "phy" ] || [ "$1" = "both" ] ; then
    docker volume rm phy-pg-test && docker volume create phy-pg-test
fi

if [ "$1" = "cs" ] || [ "$1" = "both" ] ; then
    docker volume rm cs-pg-test && docker volume create cs-pg-test
fi
