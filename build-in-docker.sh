set -e
cd "$(dirname "$0")"

docker-compose -f compose-builder.yml run --rm build /build.sh $@
