import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, ref, nextTick } from 'vue';
import { useRefs } from '../src/index';

describe('useRefs', () => {
  it('should return correct interface and support basic ref setting', async () => {
    const TestComponent = defineComponent({
      setup() {
        const [setRef, refs] = useRefs<HTMLElement>();

        return {
          setRef,
          refs,
          setRefType: typeof setRef,
          refsIsMap: refs.value instanceof Map,
          initialSize: refs.value.size
        };
      },
      template: `<div :ref="setRef('test-key')" data-testid="test-element">测试元素</div>`
    });

    const wrapper = mount(TestComponent);

    expect(wrapper.vm.setRefType).toBe('function');
    expect(wrapper.vm.refsIsMap).toBe(true);
    expect(wrapper.vm.initialSize).toBe(0);

    await nextTick();
    expect(wrapper.vm.refs.get('test-key')).toBe(
      wrapper.find('[data-testid="test-element"]').element
    );
    expect(wrapper.vm.refs.size).toBe(1);
  });

  it('should support multiple key types', async () => {
    const TestComponent = defineComponent({
      setup() {
        const [setRef, refs] = useRefs<HTMLElement>();

        return { setRef, refs };
      },
      template: `
        <div>
          <div :ref="setRef('string-key')" data-testid="string-element">字符串键</div>
          <div :ref="setRef(123)" data-testid="number-element">数字键</div>
          <div :ref="setRef(0)" data-testid="zero-element">零键</div>
          <div :ref="setRef('')" data-testid="empty-element">空字符串键</div>
        </div>
      `
    });

    const wrapper = mount(TestComponent);
    await nextTick();

    expect(wrapper.vm.refs.size).toBe(4);

    expect(wrapper.vm.refs.has('string-key')).toBe(true);
    expect(wrapper.vm.refs.has(123)).toBe(true);
    expect(wrapper.vm.refs.has(0)).toBe(true);
    expect(wrapper.vm.refs.has('')).toBe(true);

    expect(wrapper.vm.refs.get('string-key')).toBe(
      wrapper.find('[data-testid="string-element"]').element
    );
    expect(wrapper.vm.refs.get(123)).toBe(
      wrapper.find('[data-testid="number-element"]').element
    );
  });

  it('should handle dynamic multi-ref scenarios', async () => {
    const TestComponent = defineComponent({
      setup() {
        const [setRef, refs] = useRefs<HTMLElement>();
        const items = ref(['item1', 'item2']);

        const addItem = () => {
          items.value.push(`item${items.value.length + 1}`);
        };

        return { setRef, refs, items, addItem };
      },
      template: `
        <div>
          <div :ref="setRef('static1')" data-testid="static1">静态 1</div>
          <div :ref="setRef('static2')" data-testid="static2">静态 2</div>
          
          <div
            v-for="(item, index) in items"
            :key="item"
            :ref="setRef(index)"
            :data-testid="item"
          >
            {{ item }}
          </div>
          <button @click="addItem" data-testid="add-btn">添加</button>
        </div>
      `
    });

    const wrapper = mount(TestComponent);
    await nextTick();

    expect(wrapper.vm.refs.size).toBe(4);
    expect(wrapper.vm.refs.has('static1')).toBe(true);
    expect(wrapper.vm.refs.has('static2')).toBe(true);
    expect(wrapper.vm.refs.has(0)).toBe(true);
    expect(wrapper.vm.refs.has(1)).toBe(true);

    await wrapper.find('[data-testid="add-btn"]').trigger('click');
    await nextTick();

    expect(wrapper.vm.refs.size).toBe(5);
    expect(wrapper.vm.refs.has(2)).toBe(true);
    expect(wrapper.findAll('[data-testid^="item"]')).toHaveLength(3);
  });

  it('should correctly handle conditional rendering and ref overriding', async () => {
    const TestComponent = defineComponent({
      setup() {
        const [setRef, refs] = useRefs<HTMLElement>();
        const showFirst = ref(true);
        const showConditional = ref(true);

        const toggleElement = () => {
          showFirst.value = !showFirst.value;
        };

        const toggleConditional = () => {
          showConditional.value = !showConditional.value;
        };

        return {
          setRef,
          refs,
          showFirst,
          showConditional,
          toggleElement,
          toggleConditional
        };
      },
      template: `
        <div>
          <div v-if="showFirst" :ref="setRef('same-key')" data-testid="first-element">第一个</div>
          <span v-else :ref="setRef('same-key')" data-testid="second-element">第二个</span>
          
          <div v-if="showConditional" :ref="setRef('conditional')" data-testid="conditional-element">条件元素</div>
          
          <button @click="toggleElement" data-testid="toggle-element-btn">切换元素</button>
          <button @click="toggleConditional" data-testid="toggle-conditional-btn">切换条件</button>
        </div>
      `
    });

    const wrapper = mount(TestComponent);
    await nextTick();

    expect(wrapper.vm.refs.size).toBe(2);
    expect(wrapper.vm.refs.get('same-key')).toBe(
      wrapper.find('[data-testid="first-element"]').element
    );
    expect(wrapper.vm.refs.has('conditional')).toBe(true);

    await wrapper.find('[data-testid="toggle-element-btn"]').trigger('click');
    await nextTick();

    expect(wrapper.vm.refs.get('same-key')).toBe(
      wrapper.find('[data-testid="second-element"]').element
    );
    expect(wrapper.vm.refs.size).toBe(2);

    await wrapper
      .find('[data-testid="toggle-conditional-btn"]')
      .trigger('click');
    await nextTick();

    expect(wrapper.vm.refs.get('conditional')).toBe(null);
    expect(wrapper.vm.refs.has('conditional')).toBe(true);
  });

  it('should correctly cleanup and rebuild refs on component updates', async () => {
    const TestComponent = defineComponent({
      setup() {
        const [setRef, refs] = useRefs<HTMLElement>();
        const count = ref(0);
        const showExtra = ref(false);

        const increment = () => {
          count.value++;
        };

        const toggleExtra = () => {
          showExtra.value = !showExtra.value;
        };

        return { setRef, refs, count, showExtra, increment, toggleExtra };
      },
      template: `
        <div>
          <div :ref="setRef('main')" data-testid="main-element">计数：{{ count }}</div>
          <div v-if="showExtra" :ref="setRef('extra')" data-testid="extra-element">额外元素</div>
          <button @click="increment" data-testid="increment-btn">增加</button>
          <button @click="toggleExtra" data-testid="toggle-extra-btn">切换额外元素</button>
        </div>
      `
    });

    const wrapper = mount(TestComponent);
    await nextTick();

    expect(wrapper.vm.refs.size).toBe(1);
    expect(wrapper.vm.refs.has('main')).toBe(true);

    await wrapper.find('[data-testid="increment-btn"]').trigger('click');
    await nextTick();

    expect(wrapper.vm.refs.size).toBe(1);
    expect(wrapper.vm.refs.has('main')).toBe(true);
    expect(wrapper.find('[data-testid="main-element"]').text()).toBe('计数：1');

    await wrapper.find('[data-testid="toggle-extra-btn"]').trigger('click');
    await nextTick();

    expect(wrapper.vm.refs.size).toBe(2);
    expect(wrapper.vm.refs.has('extra')).toBe(true);

    await wrapper.find('[data-testid="increment-btn"]').trigger('click');
    await nextTick();

    expect(wrapper.vm.refs.size).toBe(2);
    expect(wrapper.vm.refs.has('main')).toBe(true);
    expect(wrapper.vm.refs.has('extra')).toBe(true);
  });

  it('should be able to reference child components and call their methods', async () => {
    const FooComponent = defineComponent({
      name: 'FooComponent',
      setup() {
        const testMethod = () => {
          return 'Hello from Foo component';
        };

        return {
          test: testMethod
        };
      },
      template: `<div class="foo-component">Foo Component</div>`
    });

    const TestComponent = defineComponent({
      components: {
        FooComponent
      },
      setup() {
        const [setRef, refs] = useRefs<InstanceType<typeof FooComponent>>();
        const items = ref([0, 1]);
        const results = ref<string[]>([]);

        const callTestMethods = () => {
          results.value = [];
          items.value.forEach((_, index) => {
            const componentRef = refs.value.get(index);
            if (componentRef && componentRef.test) {
              const result = componentRef.test();
              results.value.push(result);
            }
          });
        };

        return {
          setRef,
          refs,
          items,
          results,
          callTestMethods
        };
      },
      template: `
        <div>
          <FooComponent
            v-for="(item, index) in items"
            :key="item"
            :ref="setRef(index)"
            :data-testid="'foo-' + index"
          />
          <button @click="callTestMethods" data-testid="call-test-btn">调用测试方法</button>
          <div data-testid="results">{{ results.join(', ') }}</div>
        </div>
      `
    });

    const wrapper = mount(TestComponent);
    await nextTick();

    expect(wrapper.vm.refs.size).toBe(2);
    expect(wrapper.vm.refs.has(0)).toBe(true);
    expect(wrapper.vm.refs.has(1)).toBe(true);

    const firstComponent = wrapper.vm.refs.get(0);
    const secondComponent = wrapper.vm.refs.get(1);

    expect(firstComponent).toBeDefined();
    expect(secondComponent).toBeDefined();
    expect(typeof firstComponent?.test).toBe('function');
    expect(typeof secondComponent?.test).toBe('function');

    const firstResult = firstComponent?.test();
    const secondResult = secondComponent?.test();

    expect(firstResult).toBe('Hello from Foo component');
    expect(secondResult).toBe('Hello from Foo component');

    await wrapper.find('[data-testid="call-test-btn"]').trigger('click');
    await nextTick();

    expect(wrapper.vm.results).toEqual([
      'Hello from Foo component',
      'Hello from Foo component'
    ]);

    expect(wrapper.find('[data-testid="results"]').text()).toBe(
      'Hello from Foo component, Hello from Foo component'
    );

    expect(wrapper.findAll('[data-testid^="foo-"]')).toHaveLength(2);
    expect(wrapper.findAll('.foo-component')).toHaveLength(2);
  });
});
