#!/bin/bash

# =============================================================================
# rebase.sh - main 브랜치를 기반으로 blog 브랜치를 리베이스하는 스크립트
# =============================================================================

set -e  # 에러 발생 시 즉시 종료

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로그 함수들
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_step() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}📌 $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# 에러 핸들러
handle_error() {
    log_error "스크립트 실행 중 오류가 발생했습니다."
    log_error "라인 $1 에서 실패"
    exit 1
}

trap 'handle_error $LINENO' ERR

# 메인 스크립트 시작
echo -e "\n${GREEN}🚀 Rebase 스크립트를 시작합니다...${NC}\n"

# Step 1: main 브랜치로 체크아웃
log_step "Step 1/5: main 브랜치로 체크아웃"
if git checkout main; then
    log_success "main 브랜치로 전환 완료"
else
    log_error "main 브랜치로 전환 실패"
    exit 1
fi

# Step 2: girok 리모트에서 main pull
log_step "Step 2/5: girok 리모트에서 main 브랜치 가져오기"

BEFORE_PULL=$(git rev-parse HEAD)

if git pull girok main; then
    log_success "girok/main에서 pull 완료"
    
    AFTER_PULL=$(git rev-parse HEAD)
    if [ "$BEFORE_PULL" != "$AFTER_PULL" ]; then
        echo -e "\n${BLUE}📥 girok에서 가져온 커밋들:${NC}"
        git log --oneline "$BEFORE_PULL".."$AFTER_PULL"
        echo ""
    else
        echo -e "\n${YELLOW}📭 girok에서 새로운 커밋이 없습니다.${NC}\n"
    fi
else
    log_error "girok/main에서 pull 실패"
    exit 1
fi

# Step 3: blog 브랜치로 체크아웃
log_step "Step 3/5: blog 브랜치로 체크아웃"
if git checkout blog; then
    log_success "blog 브랜치로 전환 완료"
else
    log_error "blog 브랜치로 전환 실패"
    exit 1
fi

# Step 4: main 기반으로 리베이스
log_step "Step 4/5: main 브랜치 기반으로 리베이스"
if git rebase main; then
    log_success "리베이스 완료"
else
    log_error "리베이스 실패 - 충돌을 해결한 후 'git rebase --continue'를 실행하세요"
    exit 1
fi

# Step 5: 강제 푸시 및 배포
log_step "Step 5/5: 원격 저장소에 강제 푸시 및 배포"

echo -e "\n${YELLOW}📋 girok-md 기반 개인 블로그 전용 수정 사항 목록:${NC}"
git log --oneline origin/blog..HEAD 2>/dev/null || echo "  (새로운 커밋 없음 또는 원격 브랜치 없음)"
echo ""

log_warning "강제 푸시는 원격 저장소의 히스토리를 덮어쓰고 GitHub Actions 배포가 시작됩니다!"
echo -en "${YELLOW}블로그를 배포하시겠습니까? (y/N): ${NC}"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    log_info "강제 푸시를 수행합니다..."
    if git push --force; then
        log_success "강제 푸시 완료"
        
        log_info "GitHub Actions workflow 상태를 확인합니다..."
        echo -e "${BLUE}⏳ workflow가 시작될 때까지 대기 중...${NC}"
        sleep 5
        
        RUN_ID=$(gh run list --branch blog --limit 1 --json databaseId --jq '.[0].databaseId' 2>/dev/null)
        
        if [ -z "$RUN_ID" ]; then
            log_warning "workflow run을 찾을 수 없습니다. GitHub Actions 설정을 확인하세요."
        else
            log_info "Workflow Run ID: $RUN_ID"
            echo -e "${BLUE}🔄 배포 상태를 확인 중... (Ctrl+C로 중단 가능)${NC}\n"
            
            MAX_ATTEMPTS=120
            ATTEMPT=0
            
            while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
                RUN_STATUS=$(gh run view "$RUN_ID" --json status,conclusion --jq '.status')
                RUN_CONCLUSION=$(gh run view "$RUN_ID" --json status,conclusion --jq '.conclusion')
                
                if [ "$RUN_STATUS" = "completed" ]; then
                    echo ""
                    if [ "$RUN_CONCLUSION" = "success" ]; then
                        log_success "🎉 배포가 성공적으로 완료되었습니다!"
                        echo -e "${GREEN}🌐 블로그가 업데이트되었습니다.${NC}"
                        echo -e "${GREEN}🔗 https://7loro.github.io/${NC}"
                    elif [ "$RUN_CONCLUSION" = "failure" ]; then
                        log_error "배포가 실패했습니다."
                        echo -e "${RED}🔍 자세한 내용: gh run view $RUN_ID${NC}"
                    elif [ "$RUN_CONCLUSION" = "cancelled" ]; then
                        log_warning "배포가 취소되었습니다."
                    else
                        log_warning "배포 결과: $RUN_CONCLUSION"
                    fi
                    break
                fi
                
                ELAPSED=$((ATTEMPT * 5))
                printf "\r${BLUE}⏳ 배포 진행 중... (${ELAPSED}초 경과, 상태: ${RUN_STATUS})${NC}    "
                
                ATTEMPT=$((ATTEMPT + 1))
                sleep 5
            done
            
            if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
                echo ""
                log_warning "타임아웃: workflow가 아직 진행 중입니다."
                echo -e "${YELLOW}💡 상태 확인: gh run view $RUN_ID${NC}"
            fi
        fi
    else
        log_error "강제 푸시 실패"
        exit 1
    fi
else
    log_warning "사용자가 취소했습니다. 배포를 건너뜁니다."
    echo -e "${YELLOW}💡 수동으로 배포하려면: git push --force${NC}"
fi

# 완료 메시지
echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 모든 작업이 성공적으로 완료되었습니다!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
