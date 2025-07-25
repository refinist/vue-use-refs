import type { Ref, ComponentPublicInstance } from 'vue';
export type Key = string | number;
export type RefType = Element | ComponentPublicInstance | null;
export type RefsValue<T = unknown> = Map<Key, T>;
export type UseRef<T = unknown> = [
  (key: Key) => (el: RefType) => void,
  Ref<RefsValue<T>>
];
