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
ROOT_DIR=$(realpath "$__DIR/..")

LINK_DEPS="@wdio/types @wdio/protocols @wdio/repl @wdio/logger @wdio/utils @wdio/config webdriver webdriverio"
LINK_DEPS2="expect-webdriverio"

PACKAGE_DIR_NAMES=(
    qa-types
    qa-logger
    qa-globals
    qa-drivers
    qa-pages
    qa-runtime-env
    qa-cli
)

PACKAGES_DIR="$ROOT_DIR"

JOBS="$1"
if [[ "$JOBS" =~ "h" ]]; then
   usage
   exit 0
fi

if [[ ! "$JOBS" =~ ^[$AVAILABLE_CMDS]*$ ]]; then
    usage "Error: Invalid command(s), $JOBS"
    exit 1
fi

shift
TARGET_PACKAGES=( "$@" )
if [[ "$TARGET_PACKAGES" == "" ]]; then
    TARGET_PACKAGES=( ${PACKAGE_DIR_NAMES[@]} )
fi

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

            # N.B.
            # 'package-lock.json'이 없는 상태에서 `expect-webdriverio`를 `npm install` 전에 link하면 다음 에러 발생한다.
            # npm ERR! Cannot set properties of null (setting 'peer')
            #
            # Workaround
            # `npm install` 이후 `expect-webdriverio`를 설치하면 해당 에러를 회피할 수 있다.
            # 하지만 `package-lock.json` 상에는 npm repo에 있는 `expect-webdriverio` 정보가 저장된다.
            # 

            npm link @wdio/types @wdio/protocols @wdio/repl @wdio/logger @wdio/utils @wdio/config webdriver webdriverio @wdio/globals
            npm install
            npm link @wdio/types @wdio/protocols @wdio/repl @wdio/logger @wdio/utils @wdio/config webdriver webdriverio expect-webdriverio @wdio/globals
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
            res="$?"
        fi
    fi

    # check result
    if [ "$res" -ne 0 ]; then return "$res"; fi

    # linking
    if [[ "$jobs" =~ [lL] ]]; then
        echo ">>> Linking $name"
        if [[ ! "$jobs" =~ "d" ]]; then
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
        echo ">>> Uninking $name"
        if [[ ! "$jobs" =~ "d" ]]; then
            if [[ "$jobs" =~ "u" ]]; then npm unlink $name;
            else
                rm -f "$NPM_GLOBAL_DIR/$name"
                if [[ "$name" == "qarify" ]]; then
                    # remove bin file
                    # TODO: read bin name from package.json
                    # need su, so print only
                    echo ""
                    echo "#################################"
                    echo "###   NOTICE                  ###"
                    echo "#################################"
                    echo ""
                    echo "Remove bin files with the following command"
                    echo "rm -f $NPM_GLOBAL_BIN_DIR/qarify $NPM_GLOBAL_BIN_DIR/qy"
                    echo ""
                fi
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

    for pkg_dir in "${TARGET_PACKAGES[@]}" ; do
        pushd "$PACKAGES_DIR/$pkg_dir" >> /dev/null
        _do_jobs $job
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
        find . \( -name "node_modules" -type d \) -o \( -name "$BUILD_DIR_NAME" -type d \) -o \( -name "package-lock.json" -type f \) | xargs rm -rf
    elif [[ "$JOBS" =~ "C" ]]; then
        find . \( -name "node_modules" -type d \) -o \( -name "$BUILD_DIR_NAME" -type d \) | xargs rm -rf
    else
        find . -name "$BUILD_DIR_NAME" -type d | xargs rm -rf
    fi
    popd > /dev/null
    JOBS="${JOBS/[cCD]/}"
fi

#
# install on root
#
if [[ "$JOBS" =~ [iI] ]]; then
    pushd "$ROOT_DIR" > /dev/null

    _install_deps "$JOBS"
    res="$?"
    
    if [ "$res" -ne 0 ]; then exit "$res"; fi
    popd > /dev/null

    JOBS="${JOBS/[iI]/}"
fi

[[ "$JOBS" == "" || "$JOBS" == "d" ]] && exit 0

#
# do jobs for each packages
#
for pkg_dir in "${TARGET_PACKAGES[@]}" ; do
    pushd "$PACKAGES_DIR/$pkg_dir" >> /dev/null
    _do_jobs $JOBS
    res="$?"
    if [ "$res" -ne 0 ]; then exit "$res"; fi
    popd > /dev/null
done
