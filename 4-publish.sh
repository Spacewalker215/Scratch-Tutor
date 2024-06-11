#!/bin/bash
set -e

# Function to display a message and exit if there's an error
function error_exit {
    echo "$1" >&2
    exit 1
}

# Verify SCRATCH_SRC_HOME is set
echo "Verifying location of Scratch source is known"
if [ -z "$SCRATCH_SRC_HOME" ]; then
    error_exit "Error: SCRATCH_SRC_HOME environment variable is not set."
fi

# Check if Scratch has been patched
echo "Checking that Scratch has been patched"
if [ ! -f "$SCRATCH_SRC_HOME/patched" ]; then
    error_exit "Error: Scratch has not yet been patched. Run ./0-setup.sh"
fi

# Navigate to the script's directory
if [[ $BASH_SOURCE = */* ]]; then
  cd -- "${BASH_SOURCE%/*}/" || exit
fi

# Commit any changes to the repository
echo "Committing any changes"
git add your-scratch-extension || error_exit "Error: Failed to add 'your-scratch-extension'"
git add dependencies || error_exit "Error: Failed to add 'dependencies'"
git commit -m "Update" || echo "No changes to commit"
git push origin master || error_exit "Error: Failed to push to master"

# Build the Scratch fork
echo "Building the Scratch fork"
./2-build.sh || error_exit "Error: Build failed"

# Prepare and checkout the gh-pages branch
DEVBRANCH=$(git rev-parse --abbrev-ref HEAD)
if git rev-parse --verify gh-pages >/dev/null 2>&1; then
  git checkout gh-pages || error_exit "Error: Failed to checkout gh-pages"
else
  git checkout -b gh-pages || error_exit "Error: Failed to create gh-pages branch"
fi

# Prepare the publish folder
echo "Preparing the publish folder"
if [ -d "scratch" ]; then
  rm -rf ./scratch/* || error_exit "Error: Failed to clear the scratch directory"
else
  mkdir scratch || error_exit "Error: Failed to create scratch directory"
fi

# Copy build files to the publish folder
echo "Publishing the Scratch fork"
cp -rf "$SCRATCH_SRC_HOME/scratch-gui/build/"* ./scratch/ || error_exit "Error: Failed to copy files to scratch directory"
git add scratch || error_exit "Error: Failed to add scratch directory"
git commit -m "Update" || echo "No changes to commit on gh-pages"
git push origin gh-pages || error_exit "Error: Failed to push to gh-pages"

# Return to the development branch
git checkout "$DEVBRANCH" || error_exit "Error: Failed to checkout the development branch"

# Assuming your GitHub repository URL is something like https://github.com/username/repository
# Modify the following line to match your repository URL
REPO_URL="https://github.com/Spacewalker215/Scratch-Tutor/"

# Display the success message with the URL
echo "Website successfully made. You can visit it at: ${REPO_URL}/gh-pages/scratch/"
