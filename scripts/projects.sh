#
# Projects Configuration
#
PROJECTS='{
  "root": {
    "is_root": true,
    "path": ".",
    "link_deps": "webdriver webdriverio expect-webdriverio vite-plugin-ti-browserify",
    "build": "NONE",
    "compile": "NONE"
  },
  "types": {
    "path": "packages/qa-types",
    "link": true
  },
  "logger": {
    "path": "packages/qa-logger",
    "link": true
  },
  "globals": {
    "path": "packages/qa-globals",
    "link": true
  },
  "drivers": {
    "path": "packages/qa-drivers",
    "link": true
  },
  "pages": {
    "path": "packages/qa-pages",
    "link": true
  },
  "runtime": {
    "path": "packages/qa-runtime-env",
    "link": true
  },
  "browser": {
    "path": "packages/qa-browser",
    "link": true
  },
  "cli": {
    "path": "packages/qa-cli",
    "link": true
  }
}'

#
# get parsed projects
#
# @returns parsed compacted JSON string
# - sample output:
#  {"rollup":"rollup-plugin","buffer":"ti-buffer"} 
function projects_parse() {
  local input="${1:-$PROJECTS}"
  local projects=$(printf "$input" | jq -c '.')
  printf "$projects"
}

#
# get keys of PROJECTS in lines
#
# @param $1 projects
# @returns lines of keys
# - sample output:
#  rollup
#  buffer
function projects_keys() {
  local input="${1:-$PROJECTS}"
  local keys=$(printf "$input" | jq -r 'keys_unsorted[]')
  printf "$keys"
}

#
# check whether the given projects has the specified key
# 
# @param $1 projects
# @param $2 key
# @returns true if the key exists, false if not
# - sample output:
#  true
function projects_has_key() {
  local input="${2:-$PROJECTS}"
  local has=$(printf "$input" | jq has\(\"$1\"\)) # silent
  printf "$has"
}

#
# get values of PROJECTS in lines
#
# - sample output:
#  rollup-plugin
#  ti-buffer
function projects_values() {
  local input="${1:-$PROJECTS}"
  local values=$(printf "$input" | jq -rc '.[]')
  printf "$values"
}

#
# get values of the specified key
#
# @param $1 key name. e.g. a.b
# @returns a value of the key if exists
function projects_get() {
  local input="${2:-$PROJECTS}"
  local value=$(printf "$input" | jq -rc ".\"$1\"")
  printf "$value"
}

function projects_get_prop() {
  local prop="$2"
  local input="${3:-$PROJECTS}"

  local value="null"
  local type=$(printf "$input" | jq ".\"$1\"|type==\"string\"")
  if [[ "$type" != "true" ]]; then
    # assume object type
    value=$(printf "$input" | jq -rc ".\"$1\".\"$prop\"")
  fi
  printf "$value"
}

function projects_get_path() {
  local input="${2:-$PROJECTS}"
  local value="null"
  local type=$(printf "$input" | jq ".\"$1\"|type==\"string\"")
  if [[ "$type" != "true" ]]; then
    # assume object type
    value=$(printf "$input" | jq -rc ".\"$1\".path")
  else
    value=$(printf "$input" | jq -rc ".\"$1\"")
  fi
  printf "$value"
}

function projects_get_compile() {
  local input="${2:-$PROJECTS}"
  local value="null"
  local type=$(printf "$input" | jq ".\"$1\"|type==\"string\"")
  if [[ "$type" != "true" ]]; then
    # assume object type
    value=$(printf "$input" | jq -rc ".\"$1\".compile")
  fi
  printf "$value"
}

# =========================================
# Test & Reference Code
#

function _assert() {
  RED='\033[0;31m'
  GREEN='\033[0;32m'
  BLUE='\033[0;34m'
  NO_COLOR='\033[0m'

  if [[ $2 == $3 ]]; then
    printf "$GREEN passed $1$NO_COLOR\n"
    printf "  $BLUE Received: >>>$3<<<$NO_COLOR\n"
  else
    printf "$RED falied $1$NO_COLOR\n"
    printf "  $BLUE Expected: >>>$2<<<$NO_COLOR\n"
    printf "  $RED Received: >>>$3<<<$NO_COLOR\n"
  fi
}

function _print_to_hex() {
  local input="$1"
  length=${#input}
  echo "length: $length"
  for ((i = 0; i < length; i++)); do
      char="${input:i:1}"
      printf "%02X" "\"$char"
  done
  echo ""
}

function _test() {
  local _test_projects='{"a":"path-a","b":{"path":"path-b","link_deps":"links-b","compile":"NONE","link":false},"c":{}}'
  local gt_keys=$(printf 'a\nb\nc') # should use `printf` to compare '\n'
  local gt_values=$(printf 'path-a\n{"path":"path-b","link_deps":"links-b","compile":"NONE","link":false}\n{}')
  local projects=$(projects_parse $_test_projects)
  _assert "projects_parse()" "$_test_projects" "$projects"

  # keys list
  local keys=$(projects_keys $projects)
  _assert "projects_keys()" "$gt_keys" "$keys"

  local has_key=$(projects_has_key "a" $projects)
  local no_key=$(projects_has_key "not-a" $projects)
  _assert "projects_has_key()" "true,false" "$has_key,$no_key"

  # values list
  local values=$(projects_values $projects)
  _assert "projects_values()" "$gt_values" "$values"

  # get value
  local value=$(projects_get "a" $projects)
  local novalue=$(projects_get "not-a" $projects)
  _assert "projects_get()" "path-a,null" "$value,$novalue"

  # get path
  local path1=$(projects_get_path "a" $projects)
  local path2=$(projects_get_path "b" $projects)
  local path3=$(projects_get_path "c" $projects)
  _assert "projects_get_path()" "path-a,path-b,null" "$path1,$path2,$path3"

  # get compile
  local compile1=$(projects_get_compile "a" $projects)
  local compile2=$(projects_get_compile "b" $projects)
  local compile3=$(projects_get_compile "c" $projects)
  _assert "projects_get_compile()" "null,NONE,null" "$compile1,$compile2,$compile3"

  # get prop
  local prop1=$(projects_get_prop "a" "compile" $projects)
  local prop2=$(projects_get_prop "b" "compile" $projects)
  local prop3=$(projects_get_prop "c" "compile" $projects)
  _assert "projects_get_prop(compile)" "null,NONE,null" "$prop1,$prop2,$prop3"

  local prop1=$(projects_get_prop "a" "link_deps" $projects)
  local prop2=$(projects_get_prop "b" "link_deps" $projects)
  local prop3=$(projects_get_prop "c" "link_deps" $projects)
  _assert "projects_get_prop(link_deps)" "null,links-b,null" "$prop1,$prop2,$prop3"

  local prop1=$(projects_get_prop "a" "link" $projects)
  local prop2=$(projects_get_prop "b" "link" $projects)
  local prop3=$(projects_get_prop "c" "link" $projects)
  _assert "projects_get_prop(link)" "null,false,null" "$prop1,$prop2,$prop3"

  # iteration
  while IFS= read -r key; do
    local value=$(projects_get "$key" $projects)
    _assert "iterate keys" "$value" "$value"
  done <<< "$keys"


  # # iteration
  # while IFS= read -r value; do
  #   _assert "iterate values" "$value" "$value"
  # done <<< "$values"
}

# _test

function _references() {

  keys=$(echo $projects | jq -r 'keys[]')
  echo "$keys" # 

  has=$(echo $projects | jq 'has("rollup")')
  echo "$has" # true

  values=$(echo $projects | jq -r '.[]')
  echo "$values"

  # iterate project directories
  while IFS= read -r value; do
      echo "$value"
      pushd "$ROOT_DIR/$value"

      popd > /dev/null
  done <<< "$values"
}
