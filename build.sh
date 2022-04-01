#! /bin/bash

set -e # Exit on failure

# Specify --force at any position in the argument list to rebuild all images regardless of whether they already exist.

if [ "$1" == "--force" ]; then
  FORCE_BUILD=1
  shift
fi

if test -z "$1"; then
  read -p "isaac-react-app version to build (e.g. v1.3.0 or ['master']): " VERSION_TO_DEPLOY
  VERSION_TO_DEPLOY=${VERSION_TO_DEPLOY:-master}
else
  VERSION_TO_DEPLOY="$1"
  shift
fi

if [ "$1" == "--force" ]; then
  FORCE_BUILD=1
  shift
fi
if [ "$2" == "--force" ]; then
  FORCE_BUILD=1
fi


BUILD_DIR=/tmp/isaacAppsDeploy

echo Building Isaac CS and Physics apps in $BUILD_DIR: $VERSION_TO_DEPLOY

rm -rf $BUILD_DIR
mkdir -p $BUILD_DIR
cd $BUILD_DIR

git clone -b $VERSION_TO_DEPLOY --depth 1 https://github.com/isaacphysics/isaac-react-app.git
cd isaac-react-app

APP_COMMIT_SHA=$(git rev-parse $VERSION_TO_DEPLOY)

# Determine segue version to use. Honest.
if [[ $VERSION_TO_DEPLOY == v* ]]; then
    source .env
    SEGUE_VERSION=$REACT_APP_API_VERSION
else
    # Change the app src to request the API from a particular branch
    if test -z "$1"; then
          read -p "Override API version to target [$VERSION_TO_DEPLOY]: " SEGUE_VERSION
    else
          SEGUE_VERSION=$1
    fi
    SEGUE_VERSION=${SEGUE_VERSION:-$VERSION_TO_DEPLOY}

    echo "" >> .env
    echo "REACT_APP_API_VERSION=$SEGUE_VERSION" >> .env
fi

set +e
docker pull "docker.isaacscience.org/isaac-cs-app:${APP_COMMIT_SHA}" >/dev/null 2>&1
PULL_FAILED=$?
set -e

if [ "${PULL_FAILED}" -ne 0 ] || [ "$FORCE_BUILD" == "1" ]; then
  echo "App image not already available for commit ${APP_COMMIT_SHA}. Building."
  npm install
  npm run build-cs
  npm run build-phy
  docker build -t "docker.isaacscience.org/isaac-cs-app:${VERSION_TO_DEPLOY}" -t "docker.isaacscience.org/isaac-cs-app:${APP_COMMIT_SHA}" --pull --build-arg API_VERSION=$SEGUE_VERSION --build-arg SUBJECT=cs .
  docker build -t "docker.isaacscience.org/isaac-phy-app:${VERSION_TO_DEPLOY}" -t "docker.isaacscience.org/isaac-phy-app:${APP_COMMIT_SHA}" --pull --build-arg API_VERSION=$SEGUE_VERSION --build-arg SUBJECT=physics .
  docker push "docker.isaacscience.org/isaac-cs-app:${VERSION_TO_DEPLOY}"
  docker push "docker.isaacscience.org/isaac-phy-app:${VERSION_TO_DEPLOY}"
  docker push "docker.isaacscience.org/isaac-cs-app:${APP_COMMIT_SHA}"
  docker push "docker.isaacscience.org/isaac-phy-app:${APP_COMMIT_SHA}"
else
  echo "App image already built for commit ${APP_COMMIT_SHA}. Skipping build."
  docker pull "docker.isaacscience.org/isaac-cs-app:${VERSION_TO_DEPLOY}"
  docker pull "docker.isaacscience.org/isaac-phy-app:${VERSION_TO_DEPLOY}"
fi


cd ..
rm -rf isaac-react-app

git clone -b $SEGUE_VERSION --depth 1 https://github.com/isaacphysics/isaac-api.git
cd isaac-api

API_COMMIT_SHA=$(git rev-parse $SEGUE_VERSION)

set +e
docker pull "docker.isaacscience.org/isaac-api:$API_COMMIT_SHA" >/dev/null 2>&1
PULL_FAILED=$?
set -e

if [ "${PULL_FAILED}" -ne 0 ] || [ "$FORCE_BUILD" == "1" ] || [ -n "$UPDATE_API_DEPS" ]; then
  echo "API image not already available for commit ${API_COMMIT_SHA}. Building."
  if [ -n "$UPDATE_API_DEPS" ]; then
      docker build -f Dockerfile-base -t isaac-api-base . --pull
  fi
  docker build -f Dockerfile-api -t "docker.isaacscience.org/isaac-api:$SEGUE_VERSION" -t "docker.isaacscience.org/isaac-api:$API_COMMIT_SHA" .
  docker push "docker.isaacscience.org/isaac-api:$SEGUE_VERSION"
  docker push "docker.isaacscience.org/isaac-api:$API_COMMIT_SHA"
  docker build -f Dockerfile-etl -t "docker.isaacscience.org/isaac-etl:$SEGUE_VERSION" -t "docker.isaacscience.org/isaac-etl:$API_COMMIT_SHA" .
  docker push "docker.isaacscience.org/isaac-etl:$SEGUE_VERSION"
  docker push "docker.isaacscience.org/isaac-etl:$API_COMMIT_SHA"
else
  echo "API image already built for commit ${API_COMMIT_SHA}. Skipping build."
  docker pull "docker.isaacscience.org/isaac-api:$SEGUE_VERSION"
  docker pull "docker.isaacscience.org/isaac-etl:$SEGUE_VERSION"
fi


cd ..
rm -rf isaac-api
echo "Build complete"
echo "Now run, for example:"
echo "   ./compose dev $VERSION_TO_DEPLOY up -d"
echo
echo "   Er, maybe. That was what we did for Isaac Physics, anyway."
