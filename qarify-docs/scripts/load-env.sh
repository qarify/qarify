#!/bin/bash

# 사용법: 이 스크립트를 source 명령어로 실행하세요.
# 예: source ./load-env.sh

# .env 파일 경로 설정
ENV_FILE=".env"

# 파일 존재 여부 확인
if [ ! -f "$ENV_FILE" ]; then
    echo "⚠️ .env 파일이 존재하지 않습니다."
    return 1
fi

# 파일을 한 줄씩 읽되, 멀티라인 값 처리 상태를 관리
in_multiline=false
current_key=""
current_value=""

while IFS= read -r line || [[ -n "$line" ]]; do
    # 주석 또는 빈 줄 건너뛰기
    if [[ "$line" =~ ^\s*# ]] || [[ -z "$line" ]]; then
        continue
    fi

    if [ "$in_multiline" = true ]; then
        # 멀티라인 값을 읽는 중인 경우
        if [[ "$line" == *\" ]]; then
            # 멀티라인의 마지막 줄을 찾은 경우
            current_value+=$'\n'${line%\"} # 마지막 따옴표 제거 후 추가
            export "$current_key=$current_value"
            in_multiline=false # 상태 초기화
        else
            # 멀티라인의 중간 줄인 경우
            current_value+=$'\n'$line
        fi
    else
        # 새로운 변수를 찾는 경우
        if [[ "$line" =~ ^([A-Za-z_][A-Za-z0-9_]*)= ]]; then
            key="${BASH_REMATCH[1]}"
            value="${line#*=}"

            # 값이 따옴표로 시작하고 같은 줄에서 끝나지 않는 경우 -> 멀티라인 시작
            if [[ "$value" == \"* ]] && [[ "$value" != *\" ]]; then
                in_multiline=true
                current_key="$key"
                current_value="${value#\"}" # 여는 따옴표 제거
            else
                # 일반적인 한 줄 변수인 경우 (따옴표 포함/미포함 모두 처리)
                # 앞뒤 공백과 따옴표를 제거하여 export
                eval export "$key=\"$(echo $value | sed -e 's/^"//' -e 's/"$//')\""
            fi
        fi
    fi
done < "$ENV_FILE"

# 변수 초기화 (스크립트 종료 후 쉘에 남지 않도록)
unset in_multiline current_key current_value
