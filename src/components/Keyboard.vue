<template>
  <div class="column no-wrap q-gutter-y-md items-center">
    <div v-for="(row, i) in keyboardLayout" :key="i" class="row no-wrap q-gutter-x-xs">
      <w-key
        v-for="char in row"
        :key="char"
        :char="char"
        :can-submit="canSubmit"
        @click="onClick"
      />
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import WKey from 'components/Key.vue';

export default defineComponent({
  name: 'KeyboardComponent',

  components: {
    WKey,
  },

  props: {
    canSubmit: Boolean,
  },

  emits: [
    'click',
  ],

  methods: {
    onClick(char) {
      this.$emit('click', char);
    },
  },

  created() {
    this.keyboardLayout = [
      'qwertyuiop'.split(''),
      'asdfghjkl'.split(''),
      ['ENTER'].concat('zxcvbnm'.split('')).concat('BS'),
    ];
  },
});
</script>
