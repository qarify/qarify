# Test Recorder

`qa-studio-extension-web`은 브라우저 조작을 녹화하고 재생하는 Chrome 확장 프로그램입니다. Qy Studio에서 `Recording`을 누르면 확장 프로그램이 로드된 브라우저와 사이드 패널이 열립니다.

## 시작 화면 (Idle)

- 패널은 항상 **Idle** 화면으로 시작합니다. 새 탭(New Tab)이나 `about:blank`에서도 마찬가지이며, 다른 페이지로 이동해도 패널을 다시 열 필요가 없습니다.
- 녹화할 수 없는 페이지(`about:blank`, `chrome://`, 새 탭, Chrome 웹 스토어 등)에서 `Start Recording`을 눌러도 녹화가 시작됩니다. 화면에 "This page can't be recorded. Navigate to a website to start capturing." 안내가 표시되며, 지원되는 웹 페이지로 이동하면 캡처가 시작됩니다.

## QA Studio 연결 상태

- 패널 상단의 상태 칩은 `Not configured` / `Connecting…` / `Connected` / `Disconnected` 중 하나를 표시합니다. 연결에 실패하면 `Connecting…`에 머무르지 않고 `Disconnected`가 됩니다.
- Qy Studio가 브라우저를 열면 host URL(및 토큰)은 자동으로 전달(`set-host-context`)됩니다. 별도로 입력할 필요가 없고, 토큰은 화면과 로그에 표시되지 않습니다.
- 상태 칩의 팝오버에는 host URL 입력과 "Continue while panel is closed" 스위치가 있습니다. 이전에 있던 `projectId`/`suiteKey` 입력 섹션은 제거되었습니다. 녹화는 Qy Studio에서 현재 활성화된 프로젝트와 suite에 추가됩니다.

## 알림(Toast)

- 성공 알림은 최소 4초 동안 표시되고, 오류 알림은 닫기 버튼을 누를 때까지 유지됩니다. 마우스를 올리면 성공 알림의 자동 닫힘이 멈춥니다. (키보드 포커스로는 멈추지 않습니다.)
- 프로젝트 추가에 성공했을 때는 오류 알림이 표시되지 않습니다.

## 안정성

- 녹화 상태(Recording/Paused), 재생 중 실패한 스텝과 그 동작 버튼은 브라우저가 확장 프로그램의 백그라운드(service worker)를 종료했다가 다시 시작해도 유지됩니다. 재생 중이던 스텝은 재시작 후 "중단됨"으로 표시되어 자동 재개되지 않습니다.
- 첫 번째 `Navigation` 이벤트는 프로젝트에 추가될 때 유지됩니다.
- 재생 시 Navigation 스텝은 탭 상태로 완료를 판단합니다. 대상 URL이 현재 URL과 같으면 첫 스텝일 때만 새로고침하고, 그 외에는 성공으로 넘어갑니다.

## 이벤트의 tabId / frameId

녹화된 각 이벤트에는 `tabId`/`frameId`가 포함됩니다. 이 값은 재생 시 어느 탭과 프레임으로 동작을 보낼지 정하는 **라우팅 정보**이며 화면에 표시되는 값이 아닙니다. `tabId`는 세션마다 달라지므로 재생 시 현재 열려 있는 탭으로 대응시킵니다.

## 알려진 제한

다음 항목은 확장 프로그램 방식의 특성에 따른 제한이며 결함으로 분류하지 않습니다.

- 여러 탭에 걸친 시나리오는 재생 시 하나의 탭에서 수행됩니다.
- `isTrusted`를 검사하는 페이지, hover 전용 메뉴, 드래그 앤 드롭, 네이티브 `<select>`, IME 입력, 클립보드 권한이 필요한 동작은 재생할 수 없습니다. 파일 선택(`<input type=file>`)은 지원되지 않습니다.
- closed shadow root, cross-origin/sandboxed iframe, PDF 뷰어, `chrome://` 페이지는 캡처할 수 없습니다. `file://` 페이지는 확장 프로그램 설정에서 "파일 URL에 대한 액세스 허용"이 필요합니다.
- 페이지가 첫 호출 전에 네이티브 대화상자(alert 등)를 띄우면 탭이 멈출 수 있으며 약 8초 후 보고됩니다.
- 링크 이동과 새로고침을 구분해 녹화하지 않습니다.
- 확장 프로그램을 다시 로드한 뒤에는 열려 있던 탭을 새로고침해야 캡처가 재개됩니다.

> 실제 사이트에서의 재생 안정성(3개 사이트 x 20회 반복) 수동 검증은 v0.75 시점에 아직 수행되지 않았습니다.
