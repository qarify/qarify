# Selectors

The WebDriver Protocol provides several selector strategies to query an element.

## See [WebdriverIO Selectors](https://webdriver.io/docs/selectors/)

## Prefix characters

| prefix | name | supported | desc. |
|--------|------|-----------|-------|
| `.` | class | web ||
| `#` | id | web | See [ID Attribute](https://webdriver.io/docs/selectors/#id-attribute) |
| `=` | text | web, mobile | See [Link Text](https://webdriver.io/docs/selectors/#link-text)|
| `*=` | partial text | web, mobile | See [Partial Link Text](https://webdriver.io/docs/selectors/#partial-link-text)|
| `<` | tag | web | See [Tag name](https://webdriver.io/docs/selectors/#tag-name) |
| `[` | name | web, mobile | See [Name Attribute](https://webdriver.io/docs/selectors/#name-attribute) |
| `//` | xpath | web, mobile | See [xPath](https://webdriver.io/docs/selectors/#xpath) |
| `aria/` | aria | web | See [aria-label](https://webdriver.io/docs/selectors/#fetch-by-aria-label) |
| `~` | accessibility id | web, mobile | See [Accessibility ID](https://webdriver.io/docs/selectors/#accessibility-id) |
| `\\class name\\` | class name | mobile | See [Class Name](https://webdriver.io/docs/selectors/#class-name) |

## Selector

- Screen 상의 element를 선택하려면 해당 element에 접근 가능한 유일한 selector가 있어야 한다.
- Web page상에서 특정 element를 명시하는 용도로 사용되는 CSS의 selector와 동일한 개념이다.
- selector를 명시하는 방법(strategy)은 `accessibility id`, `xpath`, `name`, `class name` 등 다양하다.
- 각각의 strategy 별로 장단점이 있다.
- 가장 선호되는 strategy은 `accessibility id`(ax-id)이다.
- 접근성(Accessibility) 지원을 위해 관련 기능은 구현되어야 하고 이를 사용하기 때문이다.
- `ax-id`는 속도가 빠르고(xpath 대비) 플랫폼 별로 동일한 test script 작성이 용이하다.

### Accessibility Support for ReactNative

- ReactNative는 아래 properties들을 사용해 Accessibility를 지원한다.
- 아래 샘플은 iOS 상에서 `VoiceOver`가 label, hint 순으로 읽는다.
- 아래 샘플은 Android 상에서 `TalkBack`이 label, hint 순으로 읽는다.
- See [here](https://reactnative.dev/docs/accessibility) for details

```html
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Go back"
  accessibilityHint="Navigates to the previous screen"
  onPress={onPress}>
  <View style={styles.button}>
    <Text style={styles.buttonText}>Back</Text>
  </View>
</TouchableOpacity>
```

### Accessibility Support for iOS

- See [here](https://developer.apple.com/documentation/objectivec/nsobject/1615093-accessibilityhint) for details

### Accessibility Support for Android

- See [here](https://support.google.com/accessibility/android/answer/6006564?hl=en) for details
