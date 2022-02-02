<template>
  <q-btn
    unelevated
    padding="7px"
    v-bind="props"
    @click="onClick"
  >
    <q-icon v-if="char === 'BS'" class="q-pr-xs" name="backspace"/>
    <q-icon v-else-if="char === 'ENTER'" class="q-pl-sm q-pr-xs" name="send"/>
    <div v-else style="min-width: 1.4em">{{ char }}</div>
  </q-btn>
</template>

<script>
import { defineComponent } from 'vue';
import { charsMatchType, defaultColors } from 'lib/store';
import { getMatchColor } from 'lib/solver/wordle-solver';

export default defineComponent({
  name: 'KeyComponent',

  props: {
    char: String,
    canSubmit: Boolean,
  },

  emits: [
    'click',
  ],

  computed: {
    props() {
      const matchColor = getMatchColor(charsMatchType.value[this.char]);
      const ariaLabel = this.$t('keyboard.btn_keyboard', [this.char]);

      if (this.char === 'ENTER' && this.canSubmit === true) {
        return {
          color: 'primary',
          textColor: 'w-mode-dark',
          ariaLabel,
        };
      }

      return {
        color: matchColor || defaultColors.value.color,
        textColor: matchColor !== undefined
          ? 'w-mode-dark'
          : defaultColors.value.textColor,
        ariaLabel,
        disable: this.char === 'ENTER',
      };
    },
  },

  methods: {
    onClick() {
      this.$emit('click', this.char);
    },
  },
});
</script>
