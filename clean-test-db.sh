#! /bin/bash

set -e  # Exit on failure

if [ $# -ne 1 ] || ! { [ "$1" = "ada" ] || [ "$1" = "sci" ] || [ "$1" = "both" ]; } ; then
  echo "Delete the test database Docker volumes and recreate them empty."
  echo "Usage: clean-test-db.sh [both|ada|sci]"
  exit 1
fi

if [ "$1" = "sci" ] || [ "$1" = "both" ] ; then
    docker volume rm sci-pg-test && docker volume create sci-pg-test
fi

if [ "$1" = "ada" ] || [ "$1" = "both" ] ; then
    docker volume rm ada-pg-test && docker volume create ada-pg-test
fi
