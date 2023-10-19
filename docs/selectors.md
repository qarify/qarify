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
