
#
# Apply patch to qarify build output for building vsc extension
#
# To generate diff files
# 1. copy the target file
# 2. rename the copied file to `file-edited.js` (eg. index.js and index-edited.js)
# 3. modify the `file-edited.js` and save it
# 4. run the below gen command
# gen command:
# - dirname/index.js
# `diff -u dist/dirname/index.js dist/dirname/index-edited.js > patches/qarify-1.0.0-vsce/dirname-index.diff`
# - nodejs/index.js
# `diff -u dist/nodejs/index.js dist/nodejs/index-edited.js > patches/qarify-1.0.0-vsce/nodejs-index.diff`

if [ "$1" == "revert" ]; then
  patch -p0 -R -i patches/qarify-1.0.0-vsce/dirname-index.diff
  patch -p0 -R -i patches/qarify-1.0.0-vsce/nodejs-index.diff
else
  # dirname/index.js
  patch dist/dirname/index.js patches/qarify-1.0.0-vsce/dirname-index.diff
  # nodejs/index.js
  patch dist/nodejs/index.js patches/qarify-1.0.0-vsce/nodejs-index.diff
fi
