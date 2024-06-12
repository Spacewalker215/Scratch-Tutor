#!/bin/bash
set -e

echo "Verifying location of Scratch source is known"
if [ -z "$SCRATCH_SRC_HOME" ]; then
    echo "Error: SCRATCH_SRC_HOME environment variable is not set."
    exit 1
fi

echo "Checking that Scratch has been patched"
if [ ! -f "$SCRATCH_SRC_HOME/patched" ]; then
    echo "Scratch has not yet been patched. Run ./0-setup.sh"
    exit 1
fi

# allow this script to be run from other locations, despite the
#  relative file paths used in it
if [[ $BASH_SOURCE = */* ]]; then
  cd -- "${BASH_SOURCE%/*}/" || exit
fi

echo "Commit any changes"
git add your-scratch-extension
git add dependencies
git commit -m "Update" || echo "No changes to commit"

echo "Pushing changes to master branch"
git push origin master || echo "Failed to push to master. Continuing..."

echo "Building the Scratch fork"
./2-build.sh || { echo "Build failed"; exit 1; }

echo "Preparing a gh-pages branch"
DEVBRANCH=$(git rev-parse --abbrev-ref HEAD)
if git rev-parse --verify gh-pages >/dev/null 2>&1; then
  git checkout gh-pages || { echo "Failed to checkout gh-pages"; exit 1; }
else
  git checkout -b gh-pages || { echo "Failed to create gh-pages branch"; exit 1; }
fi

echo "Pulling latest changes from remote gh-pages"
git pull origin gh-pages || { echo "Failed to pull remote gh-pages"; exit 1; }

echo "Preparing a publish folder"
if [ -d "scratch" ]; then
  rm -rf ./scratch/* || { echo "Failed to clear scratch directory"; exit 1; }
else
  mkdir scratch || { echo "Failed to create scratch directory"; exit 1; }
fi

echo "Publishing the Scratch fork"
cp -rf "$SCRATCH_SRC_HOME/scratch-gui/build/"* ./scratch/ || { echo "Failed to copy files"; exit 1; }
git add scratch || { echo "Failed to add scratch directory"; exit 1; }
git commit -m "Update" || echo "No changes to commit on gh-pages"
git push origin gh-pages || { echo "Failed to push to gh-pages"; exit 1; }

echo "Returning to dev branch"
git checkout "$DEVBRANCH" || { echo "Failed to checkout development branch"; exit 1; }

# Assuming your GitHub repository URL is something like https://github.com/username/repository
REPO_URL="https://github.com/Spacewalker215/Scratch-Tutor"

# Display the success message with the URL
echo "Website successfully made. You can visit it at: ${REPO_URL}/scratch/"
echo "Note: It may take a few minutes for changes to propagate."
