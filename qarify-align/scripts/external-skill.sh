#!/bin/bash
#
# Install external skills from `bunx skills`
#
# Usage
#
# ** Add all skills in 'shadcn/ui' repo **
# `external-skill.sh add shadcn/ui`
#
# ** Add specific skill in `shadcn/ui` repo **
# external-skill.sh add shadcn/ui --skill shadcn
#
# ** Add all default skills **
# external-skill.sh all
#
# ** List skills **
# external-skill.sh ls
# external-skill.sh ls shadcn/ui
#

CMD=${1:-ls}
REPO=${2}
ARGS=${@:3}

if [ "$CMD" == "ls" ]; then
  if [ "$REPO" == "" ]; then
    echo "Go to https://www.skills.sh"
  else
    bunx skills add "$REPO" --list --skill --yes
  fi
elif [ "$CMD" == "add" ]; then
  echo "Add skills... $ARGS"
  bunx skills add "$REPO" $ARGS --agent claude-code --project --yes
elif [ "$CMD" == "all" ]; then
  # repo-name and skill-name by SPACE seperator
  SKILLS=(
    'https://github.com/jeffallan/claude-skills react-expert'
    'https://github.com/remix-run/agent-skills react-router-data-mode'
    'https://github.com/shadcn-ui/ui shadcn'
    'https://github.com/secondsky/claude-skills tailwind-v4-shadcn'
    'https://github.com/wshobson/agents typescript-advanced-types'
  )

  for SKILL in "${SKILLS[@]}"; do
      IFS=' ' read -ra INFO <<< "$SKILL"
      echo ">>> Repo: ${INFO[0]}, Skill: ${INFO[1]}"
      if [ "${INFO[1]}" == "" ]; then
        bunx skills add ${INFO[0]} --agent claude-code --project --yes
      else
        bunx skills add ${INFO[0]} --skill ${INFO[1]} --agent claude-code --project --yes
      fi
  done
fi

echo "Done."

# bunx skills add https://github.com/remix-run/agent-skills --skill react-router-framework-mode

# bunx skills add https://github.com/vercel-labs/agent-skills --skill vercel-react-best-practices

# bunx skills add https://github.com/softaworks/agent-toolkit --skill react-dev
