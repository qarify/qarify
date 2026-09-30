# qarify-docs

## i18n

한글로 `/docs`에서 업데이트 한 후에 i18n 지원을 위해 다음 절차를 진행합니다.

- i18n 처리 절차

```sh
# i18n 폴더에 번역할 항목 갱신
pnpm run write-translations
```

### 1. [code 번역]

- [](./i18n/en/code.json)

#### Gemini prompt

Read the following i18n file, and translate the ‘message’ and ‘description’ for each item into English.

- @packages-qy/qarify-docs/i18n/en/code.json

### 2. plugin 항목 번역

- [](./i18n/en/docusaurus-plugin-content-blog/options.json)
- [](./i18n/en/docusaurus-plugin-content-docs/current.json)
- [](./i18n/en/docusaurus-theme-classic/footer.json)
- [](./i18n/en/docusaurus-theme-classic/navbar.json)

### 3. `blog/` markdown files 번역

```sh
mkdir -p i18n/en/docusaurus-plugin-content-blog
cp -r blog/** i18n/en/docusaurus-plugin-content-blog
```

### 4. `docs/` markdown files 번역

```sh
mkdir -p i18n/en/docusaurus-plugin-content-docs/current
cp -r docs/** i18n/en/docusaurus-plugin-content-docs/current
```

#### Gemini prompt

Read the following i18n file, and translate the Korean text into English.

- @packages-qy/qarify-docs/i18n/en/docusaurus-plugin-content-docs/current/overview/roadmap.mdx
- @packages-qy/qarify-docs/i18n/en/docusaurus-plugin-content-docs/current/overview/what-is-qarify.mdx

### 5. `src/pages/` markdown files 번역

- N.B. We only copy .md and .mdx files, as React pages are translated through JSON translation files already.

```sh
mkdir -p i18n/en/docusaurus-plugin-content-pages
cp -r src/pages/**.md i18n/en/docusaurus-plugin-content-pages
cp -r src/pages/**.mdx i18n/en/docusaurus-plugin-content-pages
```

### 6. 영문 번역 결과 확인

```sh
pnpm run dev --locale en
```

## Publish to gh-pages

```sh
# bundle site
pnpm run bundle

# deploy to gh-pages
pnpm run deploy-gh-pages
```
