# Publishing Guide

This document explains how to publish the `@supervaize/n8n-nodes-supervaizer` package to the npm registry so it can be installed via the n8n Community Nodes interface.

## Prerequisites

1.  **npm Account**: You need an account on [npmjs.com](https://www.npmjs.com/).
2.  **Organization Access**: Ensure you are a member of the `@supervaize` organization on npm (or create it if it doesn't exist).
3.  **Login**: Login to npm in your terminal:
    ```bash
    npm login
    ```

## Preparation

Before publishing, ensure the code is clean, built, and tested.

1.  **Run Tests**:
    ```bash
    npm test
    ```

2.  **Build the Project**:
    ```bash
    npm run build
    ```
    *Ensure the `dist` folder is populated.*

3.  **Update Version**:
    Bump the version number in `package.json`. You can use `npm version`:
    ```bash
    npm version patch  # 0.1.0 -> 0.1.1
    # or
    npm version minor  # 0.1.0 -> 0.2.0
    ```

## Publishing

To publish the package to the npm registry:

```bash
npm publish --access public
```

> **Note**: The `--access public` flag is required for scoped packages (like `@supervaize/...`) unless you have a paid npm organization plan that supports private packages. For n8n community nodes, it **must** be public.

## How n8n Discovery Works

n8n automatically discovers packages on npm that have the keyword:
`"n8n-community-node-package"`

This keyword is already configured in `package.json`. Once published, it may take a few hours for the package to appear in the n8n internal search index.

## Verification

1.  **Check npm**: Visit `https://www.npmjs.com/package/@supervaize/n8n-nodes-supervaizer` to see your published package.
2.  **Check n8n**:
    *   Open your n8n instance.
    *   Go to **Settings** > **Community Nodes**.
    *   Click **Install**.
    *   Search for `@supervaize/n8n-nodes-supervaizer` or just `supervaize`.
    *   Install and verify the nodes appear in the editor.
