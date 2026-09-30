#!/bin/bash
# 스크립트 실행 중 오류 발생 시 즉시 중단
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# 임시 파일 정리 함수 및 trap 설정
# 스크립트가 종료될 때 (성공, 실패, 중단 포함) 임시 파일을 삭제합니다.
function cleanup {
  if [ -n "$TMP_KEY_FILE" ] && [ -f "$TMP_KEY_FILE" ]; then
    echo "ℹ️ 임시 배포 키 파일을 정리합니다..."
    rm -f "$TMP_KEY_FILE"
  fi
}
trap cleanup EXIT

# 오류 발생 시 메시지 출력
function handle_error {
    echo "❌ 배포 중 오류가 발생했습니다. (Line: $1)"
    # cleanup 함수가 EXIT trap에 의해 자동으로 호출됩니다.
    exit 1
}
trap 'handle_error $LINENO' ERR


# ==============================================================================
# Docusaurus 빌드 결과물을 Deploy Key를 사용해 별도 저장소로 배포하는 스크립트
# ==============================================================================

# Load .env
source $SCRIPT_DIR/load-env.sh

# --- 설정 (사용자 환경에 맞게 수정) ---
echo "============= Configuration ================="
echo "GH_PAGES_GIT_USER=$GH_PAGES_GIT_USER"
echo "GH_PAGES_GIT_EMAIL=$GH_PAGES_GIT_EMAIL"
echo "GH_PAGES_HOSTING_REPO=$GH_PAGES_HOSTING_REPO"
echo "GH_PAGES_TARGET_BRANCH=$GH_PAGES_TARGET_BRANCH"
echo "============================================="
# -----------------------------------------

# 1. 스크립트 실행 경로가 프로젝트 루트인지 확인
if [ ! -f "docusaurus.config.ts" ]; then
    echo "❌ Docusaurus 프로젝트 루트 디렉터리에서 스크립트를 실행해주세요."
    exit 1
fi

# 2. Deploy Key가 존재하는지 확인
if [ -z "$GH_PAGES_DEPLOY_KEY" ]; then
    echo "❌ 배포키 값을 찾을 수 없습니다."
    exit 1
fi

echo "🚀 배포를 시작합니다..."

# 3. Docusaurus 사이트 빌드
echo "📦 사이트를 빌드합니다..."
pnpm run bundle

# 4. 빌드 디렉터리로 이동
cd build

# 5. Git 초기화 및 설정
echo "⚙️  Git을 설정합니다..."
if [ ! -d ".git" ]; then
  git init
fi
git config user.name "$GH_PAGES_GIT_USER"
git config user.email "$GH_PAGES_GIT_EMAIL"

# 6. 원격 저장소 설정 (SSH와 Deploy Key 사용)
# Process substitution '<()'이 일부 셸에서 호환성 문제를 일으킬 수 있으므로,
# Deploy Key를 임시 파일에 저장하는 방식으로 변경합니다.
TMP_KEY_FILE=$(mktemp)
echo "$GH_PAGES_DEPLOY_KEY" > "$TMP_KEY_FILE"
chmod 600 "$TMP_KEY_FILE" # SSH 키는 권한에 민감합니다.

# GIT_SSH_COMMAND를 사용해 현재 명령어에만 특정 SSH 키를 사용하도록 지정합니다.
# StrictHostKeyChecking=no 옵션은 자동화된 환경에서 호스트 키 확인 프롬프트를 비활성화합니다.
export GIT_SSH_COMMAND="ssh -i $TMP_KEY_FILE -o IdentitiesOnly=yes -o StrictHostKeyChecking=no"
REMOTE_URL="git@github.com:$GH_PAGES_HOSTING_REPO"

# 원격 저장소 'origin'이 없으면 추가하고, 있으면 URL을 업데이트하여 스크립트 재실행 시 오류를 방지합니다.
if ! git remote | grep -q "^origin$"; then
    git remote add origin "$REMOTE_URL"
else
    git remote set-url origin "$REMOTE_URL"
fi

# 대상 브랜치가 존재하지 않으면 새로 생성하고, 존재하면 해당 브랜치로 전환합니다.
if ! git checkout "$GH_PAGES_TARGET_BRANCH" 2>/dev/null; then
    git checkout -b "$GH_PAGES_TARGET_BRANCH"
fi

# 7. 빌드 결과물 커밋 및 푸시
echo "📤 빌드 결과물을 원격 저장소로 푸시합니다..."
git add .
git commit -m "🚀 Deploy: $(date +'%Y-%m-%d %H:%M:%S')"

# --force 옵션으로 기존 배포 내용을 덮어씀
git push --force origin "$GH_PAGES_TARGET_BRANCH"

# 8. 임시 환경 변수 해제 및 정리
# cleanup trap이 임시 파일을 삭제하므로 여기서는 변수만 해제합니다.
unset GIT_SSH_COMMAND
unset GH_PAGES_DEPLOY_KEY
unset GH_PAGES_HOSTING_REPO
unset GH_PAGES_TARGET_BRANCH
unset GH_PAGES_GIT_USER
unset GH_PAGES_GIT_EMAIL

cd ..
echo "✅ 배포가 성공적으로 완료되었습니다!"
echo "   잠시 후 GitHub Pages에서 변경사항을 확인할 수 있습니다."
echo "👍 https://qarify.github.io/qy-docs/"
