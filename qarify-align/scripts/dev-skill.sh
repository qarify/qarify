#!/bin/bash
#
# Install skills from skills.sh
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
fi

echo "Done."

# bunx skills add https://github.com/remix-run/agent-skills --skill react-router-framework-mode

# bunx skills add https://github.com/vercel-labs/agent-skills --skill vercel-react-best-practices

# bunx skills add https://github.com/softaworks/agent-toolkit --skill react-dev
