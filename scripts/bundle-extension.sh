#!/bin/bash
# Bundle the Chrome extension into a ZIP file for download
cd "$(dirname "$0")/.."
rm -f public/stingr-extension.zip
zip -r public/stingr-extension.zip extension/ -x "extension/.DS_Store" "extension/**/.DS_Store"
echo "Created public/stingr-extension.zip"
