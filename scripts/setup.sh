#!/bin/bash

#
# Install-deps / Build / Link / Unlink Packages
#

function usage() {
    echo "Usage:"
    echo "$0 [hiIbBludC] [package-dir-name]"
}

function _install_deps() {
    local jobs="$1"
    local res=0
    # install
    if [[ "$jobs" =~ [i|I] ]]; then
        echo ">>> Install dependencies under $PWD"
        if [[ ! "$jobs" =~ "d" ]]; then
            if [[ "$jobs" =~ "I" ]]; then 
                rm -rf node_modules
            fi
            #echo "npm install"
            npm install
            res="$?"
        fi
    fi
    return "$res"
}

function _do_jobs() {
    local jobs=$1
    local res=0
    # read package name
    parsed_json=$(jq '.' package.json)
    name=$(echo $parsed_json | jq '.name')
    name="${name%\"}"
    name="${name#\"}"
    version=$(echo $parsed_json | jq '.version')

    echo "\"$name\": $version"
    
    # build
    if [[ "$jobs" =~ [b|B] ]]; then
        echo ">>> Build $name"
        if [[ ! "$jobs" =~ "d" ]]; then
            if [[ "$jobs" =~ "B" ]]; then 
                npm run build
            else
                npm run compile
            fi
            #echo "npm run compile"
            res="$?"
        fi
    fi

    # check result
    if [ "$res" -ne 0 ]; then return "$res"; fi

    # linking
    if [[ "$jobs" =~ "l" ]]; then
        echo ">>> Linking $name"
        if [[ ! "$jobs" =~ "d" ]]; then
            #echo "sudo npm link $name"
            npm link
            res="$?"
        fi
    fi

    # unlinking
    if [[ "$jobs" =~ "u" ]]; then
        echo ">>> Uninking $name"
        if [[ ! "$jobs" =~ "d" ]]; then
            #echo "sudo npm unlink $name"
            npm unlink $name
            res="$?"
        fi
    fi

    return "$res"
}

__DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
ROOT_DIR=$(realpath "$__DIR/..")

PACKAGE_DIR_NAMES=(
    qa-types
    qa-globals
    qarify
    qa-cli
)

PACKAGE_DIR="$ROOT_DIR"

# -h: print usage and exit
# -i: install deps
# -I: clean install
# -b: build
# -B: clean build
# -l: link
# -u: unlink
# -d: dry run
# -c: cleanup `dist`, `node_modules`

JOBS="$1"
if [[ "$JOBS" =~ "h" ]]; then
   usage
   exit 0
fi

shift
TARGET_PACKAGES=( "$@" )
if [[ "$TARGET_PACKAGES" == "" ]]; then
    TARGET_PACKAGES=( ${PACKAGE_DIR_NAMES[@]} )
fi

# check cleanup
if [[ "$JOBS" =~ [cC] ]]; then
    pushd "$ROOT_DIR" > /dev/null
    if [[ "$JOBS" =~ "C" ]]; then
        find . \( -name "node_modules" -type d \) -o \( -name "dist" -type d \) -o \( -name "package-lock.json" -type f \) | xargs rm -rf
    else 
        find . \( -name "node_modules" -type d \) -o \( -name "dist" -type d \) | xargs rm -rf
    fi
    exit 0
fi

if [[ "$JOBS" =~ [iI] ]]; then
    pushd "$ROOT_DIR" > /dev/null
    _install_deps "$JOBS"
    res="$?"
    if [ "$res" -ne 0 ]; then exit "$res"; fi
    popd > /dev/null
fi

for dir_name in "${TARGET_PACKAGES[@]}" ; do
    pushd "$PACKAGE_DIR/$dir_name" >> /dev/null
    _do_jobs $JOBS
    res="$?"
    if [ "$res" -ne 0 ]; then exit "$res"; fi
    popd > /dev/null
done
