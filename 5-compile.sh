#!/bin/bash

# Run 2-build.sh
echo "Running 2-build.sh..."
./2-build.sh

# Check if 2-build.sh ran successfully
if [ $? -eq 0 ]; then
    echo "2-build.sh ran successfully. Now running 3-run-private.sh..."
    # Run 3-run-private.sh
    ./3-run-private.sh
else
    echo "2-build.sh encountered an error. Exiting."
    exit 1
fi
