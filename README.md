# AI DevTools Extension

This repository contains an AI-powered DevTools Chrome extension that captures JavaScript runtime errors, unhandled promise rejections, and network failures from pages and surfaces them in a DevTools side panel.

What’s included
- `src/` — TypeScript source: background service worker, content script, devtools helper, panel UI code
- `public/` — static pages used by the extension (`devtools.html`, `panel.html`, icons)
- `manifest.json` — extension manifest (MV3)
- `vite.config.ts`, `package.json`, `tsconfig.*.json` — build and TypeScript config

Quick local development

1. Install deps

```bash
npm install
```

2. Start the dev server (if available in this project)

```bash
npm run dev
```

3. Build for production

```bash
npm run build
```

4. Load the extension into Chrome/Edge locally

- Open `chrome://extensions` (or Edge's extensions page)
- Enable “Developer mode”
- Click “Load unpacked” and select the `dist/` directory produced by the build

Packaging for release

After `npm run build` the `dist/` folder should contain the packaged extension files (including `manifest.json`). Create a zip of `dist/` for uploading to the Chrome Web Store or attaching to a GitHub release:

```bash
cd dist
zip -r ../ai-devtools.zip .
```

CI / GitHub Actions

This repository includes a workflow at `.github/workflows/build-release.yml` that will:
- Install dependencies
- Run the build (`npm run build`)
- Zip the `dist/` contents and upload the zip as a workflow artifact

The workflow is triggered by a manual dispatch and by pushing a `v*.*.*` tag. It does not automatically publish to the Chrome Web Store — you can extend the workflow to do that and provide the required secrets.

Security & privacy
- Do not commit API keys, webstore credentials, or other secrets. Use GitHub Secrets for CI.
- Document any telemetry and data retention in `README.md` or `PRIVACY.md` if you collect user data.

Next steps you might want me to do
- Hook up the `panel.html` UI to open a runtime port and render stored + live errors
- Add unit tests for small helper modules
- Add a GitHub Action step to create a Release and attach the build zip automatically

If you want I can also create a release workflow that publishes directly to Chrome Web Store (requires storing OAuth credentials / refresh tokens in GitHub Secrets).
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
