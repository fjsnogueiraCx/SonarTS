#!/bin/bash
set -euo pipefail

cd packages/tslint-sonarts
yarn build
yarn test -- --coverage
yarn license-check
npm pack
cd ../..
