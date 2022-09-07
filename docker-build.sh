#!/bin/bash
set -e

VERSION=$(git describe --long --tags)
SAFE_VERSION=$(sed -e 's/[\/&]/\\&/g' <<< $VERSION)

echo $VERSION

if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' "s/^date:.*$/date: $SAFE_VERSION/" chapters/000-metadata-common.yaml
  sed -i '' "s/^  version:.*$/  version: $SAFE_VERSION/" chapters/000-metadata-common.yaml
else
  sed -i "s/^date:.*$/date: $SAFE_VERSION/" chapters/000-metadata-common.yaml
  sed -i "s/^  version:.*$/  version: $SAFE_VERSION/" chapters/000-metadata-common.yaml
fi

cat chapters/000-metadata-common.yaml

IMAGE_TAG=ebook
if [[ "$(docker images -q $IMAGE_TAG 2> /dev/null)" == "" ]]; then
  docker build -t $IMAGE_TAG .
  # docker buildx build --push --platform linux/arm64/v8,linux/amd64 --tag typeofweb/$IMAGE_TAG:latest .
fi

docker run -e BUILD_ALL=true --rm -v $(pwd):/book typeofweb/$IMAGE_TAG ./build.sh
