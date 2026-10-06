#!/bin/bash
#
# Link Agents and Skills under the target directory
#

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SRC="$(realpath "${SCRIPT_DIR}/..")"

TARGET=${1:-""}

if [ "$TARGET" == "" ]; then
  echo "TARGET directory is required"
  exit 1
elif [ ! -d "$TARGET" ]; then
  echo "Given directory, ${TARGET} does not exist."
  exit 1
fi

TARGET_CLAUDE_DIR="${TARGET}/.claude"
# TODO
# TARGET_OPENCODE_DIR="${TARGET}/.opencode"

SRC_AGENTS_DIR="${SRC}/agents"
SRC_SKILLS_DIR="${SRC}/skills"
SRC_DEV_SKILLS_DIR="${SRC}/.claude/skills"

# Ensure target directories exist
mkdir -p "${TARGET_CLAUDE_DIR}/"{agents,skills}

# agents
for file in $SRC_AGENTS_DIR/*; do 
    if [ -f "$file" ]; then 
        TARGET_AGENTS_DIR="${TARGET_CLAUDE_DIR}/agents"
        echo "AGENT: $file -> ${TARGET_AGENTS_DIR}/$(basename $file)"
        ln -snf "$file" "${TARGET_AGENTS_DIR}/$(basename $file)"
    fi 
done

# skills
for file in $SRC_SKILLS_DIR/*; do 
    if [ -d "$file" ]; then 
        TARGET_SKILLS_DIR="${TARGET_CLAUDE_DIR}/skills"
        echo "SKILL: $file -> ${TARGET_SKILLS_DIR}/$(basename $file)"
        ln -snf "$file" "${TARGET_SKILLS_DIR}/$(basename $file)"
    fi 
done

# dev-skills
for file in $SRC_DEV_SKILLS_DIR/*; do 
    if [ -d "$file" ]; then 
        TARGET_SKILLS_DIR="${TARGET_CLAUDE_DIR}/skills"
        echo "SKILL: $file -> ${TARGET_SKILLS_DIR}/$(basename $file)"
        ln -snf "$file" "${TARGET_SKILLS_DIR}/$(basename $file)"
    fi 
done

echo "Done."
