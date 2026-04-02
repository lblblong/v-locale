# Nuxt 3 SSR Isolation Demo

这个示例用于验证 vue-localeflow 在 Nuxt 3 中的 SSR 语言隔离。

推荐测试方式：

1. 启动开发服务器。
2. 打开两个无痕窗口访问同一个页面。
3. 分别切换成不同语言。
4. 刷新两个窗口，观察每个窗口是否保持自己的语言。

如果没有串语言，说明当前接入方式在请求隔离上是正常的。

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
