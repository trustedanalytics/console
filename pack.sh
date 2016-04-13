#
# Copyright (c) 2015 Intel Corporation
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

set -e

VERSION=`node -e "console.log(require('./package.json').version)"`
PROJECT_NAME=`node -e "console.log(require('./package.json').name)"`
PACKAGE_CATALOG=${PROJECT_NAME}-${VERSION}

# build project
npm install && node ./node_modules/gulp/bin/gulp.js build

# create tmp catalog
mkdir ${PACKAGE_CATALOG}

# files to package
rsync -av . ${PACKAGE_CATALOG} \
  --exclude node_modules \
  --exclude bower_components \
  --exclude .git \
  --exclude .sass-cache \
  --exclude ${PACKAGE_CATALOG}

npm install --production --prefix ${PACKAGE_CATALOG}

# prepare build manifest
echo "commit_sha=$(git rev-parse HEAD)" > ${PACKAGE_CATALOG}/build_info.ini

# create zip package
cd ${PACKAGE_CATALOG}
zip -r ../${PROJECT_NAME}-${VERSION}.zip *
cd ..

# remove tmp catalog
rm -r ${PACKAGE_CATALOG}

echo "Zip package for $PROJECT_NAME project in version $VERSION has been prepared."
