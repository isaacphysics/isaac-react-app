#!/usr/bin/env sh
set -eo pipefail

# Find and replace environment variable placeholder names with their values at run time.
echo "Replacing environment variables"
replace() {
  find $DEPLOYMENT_PATH/ -name '*.js' | xargs sed -i "s|$1|$2|g"
  find $DEPLOYMENT_PATH/ -name '*.html' | xargs sed -i "s|$1|$2|g"
}
replace REACT_APP_API_VERSION "${REACT_APP_API_VERSION}"
replace GOOGLE_RECAPTCHA_SITE_KEY "${GOOGLE_RECAPTCHA_SITE_KEY}"
replace REACT_APP_STAGING_URL "${REACT_APP_STAGING_URL}"
replace REACT_APP_API_PATH_LOCAL "${REACT_APP_API_PATH_LOCAL}"
replace REACT_APP_EDITOR_ORIGIN "${REACT_APP_EDITOR_ORIGIN}"
replace REACT_APP_GOOGLE_ANALYTICS "${REACT_APP_GOOGLE_ANALYTICS}"
replace REACT_APP_CODE_EDITOR_BASE_URL "${REACT_APP_CODE_EDITOR_BASE_URL}"