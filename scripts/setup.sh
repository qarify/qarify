#!/bin/bash

#
# Commands
#
AVAILABLE_CMDS=iIbBlLuUcCDd
function usage() {
    echo "$1"
    echo "Usage:"
    echo "  $0 <commands> [<package-dir>, ...]"
    echo ""
    echo "Available commands are as follows:"
    echo ""
    echo "  Help[h]: print usage"
    echo "  Dry run[d]: dry-run"
    echo "  Clean[cCD]: "
    echo "    - c: remove build output"
    echo "    - C: 'c' and remove deps packages"
    echo "    - D: 'D' and remove 'package-lock.json'"
    echo "  Install deps[iI]: "
    echo "    - i: install deps packages"
    echo "    - I: clean-install(same with Ci)"
    echo "  Build package[bB]:"
    echo "    - b: build packages"
    echo "    - B: clean-build(same with cb)"
    echo "  Link package[lL]:"
    echo "    - l: link packages if not exists"
    echo "    - L: link packages force"
    echo "  Unlink package[uU]:"
    echo "    - u: unlink packages with 'npm unlink'"
    echo "    - U: remove link file with 'rm'"
    echo ""
}

NPM_GLOBAL_DIR=/usr/local/lib/node_modules
NPM_GLOBAL_BIN_DIR=/usr/local/bin

BUILD_DIR_NAME=dist

__DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

# ===========================================================
# Projects configuration
#

# include configuration
source "$__DIR/projects.sh"
projects=$(projects_get)
all_packages=( $(projects_keys) ) # to array

# project root dir
ROOT_DIR=$(realpath "$__DIR/..")

# ===========================================================
# Setup Utilities
#

JOBS="$1" # first argument
if [[ "$JOBS" =~ "h" || "$JOBS" == "" ]]; then
   usage
   exit 0
fi
if [[ ! "$JOBS" =~ ^[$AVAILABLE_CMDS]*$ ]]; then
    usage "Error: Invalid command(s), $JOBS"
    exit 1
fi

shift
TARGET_PACKAGES=( "$@" ) # rest arguments
if [[ "$TARGET_PACKAGES" == "" ]]; then
    TARGET_PACKAGES=( ${all_packages[@]} )
else
    # validate package names
    for pkg in "${TARGET_PACKAGES[@]}" ; do
        res=$(projects_has_key "$pkg")
        if [[ "$res" != "true" ]]; then
            echo "!!! Invalid package name: $pkg"
            echo "    Available packages: ${all_packages[@]}"
            exit 1
        fi
    done
fi

function _install_deps() {
    local jobs="$1"
    local pkg="$2"
    local res=0
    # install
    if [[ "$jobs" =~ [i|I] ]]; then
        local link_deps=$(projects_get_prop "$pkg" "link_deps")
        echo ">>> Install deps under $PWD"
        [[ "$link_deps" != "" && "$link_deps" != "null" ]] && echo ">>> Link deps: $link_deps"

        if [[ ! "$jobs" =~ "d" ]]; then
            if [[ "$jobs" =~ "I" ]]; then 
                rm -rf node_modules
            fi
            if [[ "$link_deps" != "" && "$link_deps" != "null" ]]; then
                npm link $link_deps
            fi
            npm install
            res="$?"
        fi
    fi
    return "$res"
}

function _do_jobs() {
    local jobs="$1"
    local pkg="$2"
    local res=0
    # read package name
    parsed_json=$(jq '.' package.json)
    name=$(echo $parsed_json | jq -r '.name')
    # name="${name%\"}"
    # name="${name#\"}"
    version=$(echo $parsed_json | jq -r '.version')

    echo "$name: $version"
    
    # build
    if [[ "$jobs" =~ [b|B] ]]; then
        echo ">>> Build $name"
        if [[ ! "$jobs" =~ "d" ]]; then
            local cmd=""
            if [[ "$jobs" =~ "B" ]]; then 
                cmd=$(projects_get_prop "$pkg" "build")
                if [[ "$cmd" == "NONE" ]]; then
                    echo "Not build..."
                elif [[ "$cmd" == "" || "$cmd" == "null" ]]; then
                    # default
                    cmd='npm run build'
                fi
            else
                cmd=$(projects_get_prop "$pkg" "compile")
                if [[ "$cmd" == "NONE" ]]; then
                    echo "Not compile..."
                elif [[ "$cmd" == "" || "$cmd" == "null" ]]; then
                    # default
                    cmd='npm run compile'
                fi
            fi

            if [[ "$cmd" != "" && "$cmd" != "NONE" ]]; then
                eval " $cmd"
            fi
            res="$?"
        fi
    fi

    # check result
    if [ "$res" -ne 0 ]; then return "$res"; fi

    # linking
    if [[ "$jobs" =~ [lL] ]]; then
        local link=$(projects_get_prop "$pkg" "link")
        if [[ "$link" == "true" ]]; then 
            echo ">>> Linking $name"
        else
            echo ">>> No-Linking $name"
        fi
        if [[ ! "$jobs" =~ "d" && "$link" == "true" ]]; then
            #echo "npm link $name"
            if [[ "$jobs" =~ "L" || ! -d "$NPM_GLOBAL_DIR/$name" ]]; then
                npm link
                res="$?"
            fi
            ls -al "$NPM_GLOBAL_DIR/$name"
        fi
    fi

    # unlinking
    if [[ "$jobs" =~ [uU] ]]; then
        local link=$(projects_get_prop "$pkg" "link")
        if [[ "$link" == "true" ]]; then 
            echo ">>> Uninking $name"
        fi
        if [[ ! "$jobs" =~ "d"&& "$link" == "true" ]]; then
            if [[ "$jobs" =~ "u" ]]; then
                npm unlink $name
            else
                rm -f "$NPM_GLOBAL_DIR/$name"
            fi
            res="$?"
        fi
    fi

    return "$res"
}

#
# check cleanup
#
if [[ "$JOBS" =~ [uU] ]]; then
    echo ">>> Unlinking..."
    job=U
    if [[ "$JOBS" =~ 'u' ]]; then job=u; fi

    for pkg in "${TARGET_PACKAGES[@]}" ; do
        pkg_dir=$(projects_get_path "$pkg")
        pushd "$ROOT_DIR/$pkg_dir" > /dev/null

        _do_jobs "$job" "$pkg"
        res="$?"
        if [ "$res" -ne 0 ]; then exit "$res"; fi

        popd > /dev/null
    done
    JOBS="${JOBS/[uU]/}"
fi

if [[ "$JOBS" =~ [cCD] ]]; then
    echo ">>> Cleaning..."

    pushd "$ROOT_DIR" > /dev/null
    if [[ "$JOBS" =~ "D" ]]; then
        if [[ "$JOBS" =~ "d" ]]; then
            find . \( -name "node_modules" -type d \) -o \( -name "$BUILD_DIR_NAME" -type d \) -o \( -name "package-lock.json" -type f \)
        else
            find . \( -name "node_modules" -type d \) -o \( -name "$BUILD_DIR_NAME" -type d \) -o \( -name "package-lock.json" -type f \) | xargs rm -rf
        fi
    elif [[ "$JOBS" =~ "C" ]]; then
        if [[ "$JOBS" =~ "d" ]]; then
            find . \( -name "node_modules" -type d \) -o \( -name "$BUILD_DIR_NAME" -type d \)
        else
            find . \( -name "node_modules" -type d \) -o \( -name "$BUILD_DIR_NAME" -type d \) | xargs rm -rf
        fi
    else
        if [[ "$JOBS" =~ "d" ]]; then
            find . -name "$BUILD_DIR_NAME" -type d
        else
            find . -name "$BUILD_DIR_NAME" -type d | xargs rm -rf
        fi
    fi
    popd > /dev/null
    JOBS="${JOBS/[cCD]/}"
fi

#
# install on root
#
if [[ "$JOBS" =~ [iI] ]]; then
    echo ">>> Installing..."

    for pkg in "${TARGET_PACKAGES[@]}" ; do
        isRoot=$(projects_get_prop "$pkg" "is_root")
        if [[ "$isRoot" != "true" ]]; then
            continue
        fi
        pkg_dir=$(projects_get_path "$pkg")
        pushd "$ROOT_DIR/$pkg_dir" > /dev/null

        _install_deps "$JOBS" "$pkg"
        res="$?"
        if [ "$res" -ne 0 ]; then exit "$res"; fi

        popd > /dev/null
    done
    JOBS="${JOBS/[iI]/}"
fi

[[ "$JOBS" == "" || "$JOBS" == "d" ]] && exit 0

#
# do jobs for each packages
#
for pkg in "${TARGET_PACKAGES[@]}" ; do
    pkg_dir=$(projects_get_path "$pkg")
    pushd "$ROOT_DIR/$pkg_dir" > /dev/null

    _do_jobs "$JOBS" "$pkg"
    res="$?"
    if [ "$res" -ne 0 ]; then exit "$res"; fi

    popd > /dev/null
done
