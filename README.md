# vue-use-refs

[![npm](https://img.shields.io/npm/v/vue-use-refs.svg?colorA=42b883&colorB=35495e)](https://npmjs.com/package/vue-use-refs) [![Unit Test](https://img.shields.io/github/actions/workflow/status/refinist/vue-use-refs/unit-test.yml?colorA=42b883&colorB=35495e&label=Unit%20Test)](https://github.com/refinist/vue-use-refs/actions/workflows/unit-test.yml) [![codecov](https://img.shields.io/codecov/c/github/refinist/vue-use-refs?colorA=42b883&colorB=35495e)](https://codecov.io/github/refinist/vue-use-refs)

A lightweight composable for Vue 3 to manage multiple template refs. It provides a clean way to handle dynamic numbers of element or component references, especially useful for list rendering scenarios.

## ✨ Features

- 🚀 **Lightweight** - Zero dependencies, only a few KB gzipped
- 📦 **Type Safe** - Full TypeScript support
- 🔧 **Easy to Use** - Simple and intuitive API
- ⚡ **High Performance** - Automatic cleanup, prevents memory leaks
- 🎯 **Flexible** - Supports both string and number keys
- 🔄 **Reactive** - Seamlessly integrates with Vue's reactivity system

## 📦 Installation

```bash
# npm
npm install vue-use-refs

# yarn
yarn add vue-use-refs

# pnpm
pnpm add vue-use-refs

# bun
bun add vue-use-refs
```

## 🚀 Basic Usage

### Element References

```vue
<template>
  <div>
    <div v-for="(item, index) in items" :key="item.id" :ref="setRef(index)">
      {{ item.name }}
    </div>
    <button @click="focusFirst">Focus First Element</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRefs } from 'vue-use-refs';

const items = ref([
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
  { id: 3, name: 'Item 3' }
]);

const [setRef, refs] = useRefs<HTMLElement | null>();

const focusFirst = () => {
  const firstElement = refs.value.get(0);
  firstElement?.focus();
};
</script>
```

### Component References

```vue
<template>
  <div>
    <ChildComponent
      v-for="(item, index) in items"
      :key="item.id"
      :ref="setRef(index)"
      :title="item.title"
    />
    <button @click="callAllMethods">Call All Component Methods</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRefs } from 'vue-use-refs';
import ChildComponent from './ChildComponent.vue';

const items = ref([
  { id: 1, title: 'Component 1' },
  { id: 2, title: 'Component 2' }
]);

const [setRef, refs] = useRefs<InstanceType<typeof ChildComponent> | null>();

const callAllMethods = () => {
  items.value.forEach((_, index) => {
    const childRef = refs.value.get(index);
    childRef?.someMethod(); // Call child component method
  });
};
</script>
```

## 📚 API

### `useRefs<T>()`

Creates a new refs manager.

**Returns:**

```typescript
[setRef, refs]: [
  (key: Key) => (el: RefType) => void,
  Ref<Map<Key, T>>
]
```

- `setRef(key)` - Creates a ref function for the specified key
- `refs` - Reactive Map containing all registered references

## 📄 License

[MIT](./LICENSE)

Copyright (c) 2025-present, Zhifeng (Jeff) Wang
