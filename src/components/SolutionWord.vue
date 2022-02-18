<template>
  <q-btn
    v-bind="props"
    unelevated
    padding="6px 8px"
    @click="onClick"
  >
    <div style="min-width: 5em">{{ word }}</div>

    <q-badge
      v-if="mark"
      color="positive"
      rounded
      floating
    />
  </q-btn>
</template>

<script>
import { defineComponent } from 'vue';
import { defaultColors } from 'lib/store';

export default defineComponent({
  name: 'SolutionWordComponent',

  props: {
    word: String,
    mark: Boolean,
  },

  emits: [
    'click',
  ],

  computed: {
    props() {
      return {
        ...defaultColors.value,
        ariaLabel: this.$t('solver.btn_use_word', [this.word]),
      };
    },
  },

  methods: {
    onClick() {
      this.$emit('click', this.word);
    },
  },
});
</script>
