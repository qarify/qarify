### **개요 (Overview)**

- **QArify란? (What is QArify?)**
  - **소개:** QArify는 웹 애플리케이션의 품질 보증(QA) 프로세스를 자동화하고 간소화하기 위해 설계된 서비스입니다. 테스트 케이스 생성, 실행 및 결과 분석을 위한 포괄적인 도구 모음을 제공합니다.
  - **목표:** 개발자와 QA 엔지니어가 보다 효율적으로 협업하고, 테스트 자동화의 복잡성을 줄이며, 고품질의 소프트웨어를 더 빠르게 제공할 수 있도록 지원합니다.
  - **주요 해결 과제:** 반복적인 테스트 작업 자동화, 테스트 시나리오의 시각적 관리, 테스트 결과의 직관적인 분석 등을 통해 기존 QA 프로세스의 비효율성을 개선합니다.

- **주요 기능 (Key Features)**
  - **Test Studio:** 사용자의 상호작용을 녹화하여 테스트 시나리오를 자동으로 생성하는 시각적 테스트 레코딩 도구입니다. (`qy start`)
  - **CLI (Command Line Interface):** `qy` 명령어를 통해 프로젝트 초기화, 테스트 실행, 인증 등 서비스의 모든 기능을 제어할 수 있는 강력한 명령줄 인터페이스를 제공합니다.
  - **자동 테스트 케이스 생성:** 수집된 소스 정보를 기반으로 테스트 스위트 및 케이스를 자동으로 생성하여 테스트 준비 시간을 단축합니다. (`qy suite generate`, `qy case generate`)
  - **프로젝트 기반 관리:** `.qarifyrc.json` 설정 파일을 통해 프로젝트별로 테스트 환경, 대상 플랫폼, 결과물 경로 등을 체계적으로 관리합니다.

- **로드맵 (Roadmap)**
  - **현재 버전 (V1):** 웹 브라우저 기반 애플리케이션의 테스트 자동화를 지원합니다. 주요 기능으로는 CLI를 통한 프로젝트 관리, Test Studio를 이용한 시나리오 녹화, 테스트 실행 및 결과 분석이 포함됩니다.
  - **향후 계획:**
    - 다양한 테스트 프레임워크와의 연동 지원 강화
    - CI/CD 파이프라인 통합 기능 제공
    - 테스트 결과 분석 및 리포팅 기능 고도화
    - 모바일 애플리케이션 테스트 지원 확장

### **시작하기 (Getting Started)**

- **설치 (Installation)**
  - QArify CLI는 npm을 통해 간단하게 설치할 수 있습니다.

  - ````bash
          npm install -g qarify-cli
        ```
    ````

- **프로젝트 설정 (Project Setup)**
  - 새로운 QArify 프로젝트를 시작하려면 다음 명령어를 사용합니다.

  - ````bash
          qy init --name <project-name> --platform browser
        ```

    ````

  - 이 명령어는 프로젝트의 기본 구조와 설정 파일(`.qarifyrc.json`)을 생성합니다.

- **첫 번째 테스트 (Your First Test)**
  - **1단계: Test Studio 실행:** 테스트하고자 하는 웹사이트 주소와 함께 `qy start` 명령어를 실행하여 Test Studio를 시작합니다.

  - ````bash
          qy start https://your-test-site.com
        ```

    ````

  - **2단계: 시나리오 녹화:** Test Studio 내에서 웹사이트와 상호작용하며 테스트 시나리오를 녹화하고 저장합니다.
  - **3단계: 테스트 실행:** 저장된 시나리오를 기반으로 `qy run` 명령어를 사용하여 테스트를 실행하고 결과를 확인합니다.

### **가이드 (Guides)**

- **Test Studio 사용법 (Using the Test Studio)**
  - `qy start` 명령어로 Test Studio를 실행하면, 지정된 URL의 웹사이트가 열리며 녹화 제어판이 함께 제공됩니다.
  - 사용자는 로그인, 양식 제출, 버튼 클릭 등 일련의 행동을 수행할 수 있으며, 이러한 상호작용은 실시간으로 기록됩니다.
  - 녹화된 시나리오는 테스트 케이스로 저장하여 재사용할 수 있습니다.

- **테스트 관리 (Managing Tests)**
  - **테스트 스위트 생성:** `qy suite generate` 명령어를 사용하여 특정 페이지나 기능 단위로 테스트 스위트를 생성합니다.
  - **테스트 케이스 생성:** `qy case generate` 명령어를 사용하여 스위트 내에서 개별 테스트 케이스를 생성하고 관리합니다.

- **테스트 실행 및 결과 분석 (Running Tests & Analyzing Results)**
  - `qy run` 명령어를 통해 설정된 프로젝트의 모든 테스트 또는 특정 테스트 스위트를 실행할 수 있습니다.
  - 테스트 실행이 완료되면, 성공, 실패, 보류 등 각 테스트 케이스의 결과가 터미널에 출력됩니다.
  - (향후) 상세한 분석을 위한 HTML 리포트가 생성될 예정입니다.

- **인증 (Authentication)**
  - QArify 서비스의 특정 기능을 사용하기 위해서는 로그인이 필요합니다.
  - **로그인:** `qy auth login` 명령어를 실행하면 브라우저가 열리고 Google 계정을 통해 인증을 진행합니다.
  - **로그아웃:** `qy auth logout` 명령어로 현재 로그인된 계정을 로그아웃할 수 있습니다.

### **참고 (Reference)**

- **CLI 명령어 (CLI Commands)**
  - `qy init`: 새 프로젝트를 초기화합니다.
  - `qy start <url>`: Test Studio를 시작합니다.
  - `qy run`: 프로젝트의 테스트를 실행합니다.
  - `qy source crawl <url>`: 테스트 생성을 위한 소스 정보를 수집합니다.
  - `qy suite generate`: 테스트 스위트를 생성합니다.
  - `qy case generate`: 테스트 케이스를 생성합니다.
  - `qy auth login`: 서비스에 로그인합니다.
  - `qy auth logout`: 서비스에서 로그아웃합니다.

- **설정 (Configuration)**
  - `.qarifyrc.json` 파일은 QArify 프로젝트의 핵심 설정 파일입니다.
  - 주요 설정 항목:
    - `name`: 프로젝트 이름
    - `platform`: 테스트 대상 플랫폼 (예: 'browser')
    - `output`: 테스트 결과물이 저장될 경로
    - (기타 프로젝트별 설정)

- **타입 정의 (Type Definitions)**
  - QArify는 `@qarify/types` 패키지를 통해 프로젝트 전반에서 사용되는 TypeScript 인터페이스와 타입을 공유합니다.
  - 주요 타입:
    - `TestCase`, `TestSuite`: 테스트 케이스 및 스위트 구조 정의
    - `ProjectConfig`: 프로젝트 설정 파일 형식 정의
    - `PlayerCommandPayload`: Test Studio와 통신을 위한 명령어 페이로드 정의
