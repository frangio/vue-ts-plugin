# TypeScript Language Service Plugin for Vue

This is a fork of `vue-ts-plugin` updated for Vue 3.

It works by monkeypatching TypeScript Language Server functionality in ways
that were probably not intended by the TypeScript developers, so it should be
considered experimental.

It uses `@vue/compiler-sfc` to parse out the script section of a `.vue` file
and forward that to the TypeScript Language Server.

## Instructions

1. `$ npm install @frangio/vue-ts-plugin`
2. Add plugin to tsconfig.

```json
{
  "compilerOptions": {
    "plugins": [{ "name": "@frangio/ts-vue-plugin" }]
  }
}
```
