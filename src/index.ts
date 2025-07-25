import { onBeforeUpdate, ref } from 'vue';
import type { UseRef, RefsValue, Key, RefType } from './types';

export const useRefs = <T = unknown>(): UseRef<T> => {
  const refs = ref<RefsValue<T>>(new Map());
  const setRef = (key: Key) => (el: RefType) => {
    // @ts-ignore
    refs.value.set(key, el);
  };
  onBeforeUpdate(() => {
    refs.value = new Map();
  });
  // @ts-ignore
  return [setRef, refs];
};
