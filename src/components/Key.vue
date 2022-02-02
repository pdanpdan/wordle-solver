<template>
  <q-btn
    unelevated
    padding="7px"
    :color="color"
    :text-color="textColor"
    :aria-label="label"
    @click="onClick"
  >
    <q-icon v-if="char === 'BS'" class="q-pr-xs" name="backspace" />
    <q-icon v-else-if="char === 'ENTER'" class="q-pl-sm q-pr-xs" name="send" />
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
    matchColor() {
      return getMatchColor(charsMatchType.value[this.char]);
    },

    color() {
      return this.char === 'ENTER' && this.canSubmit === true
        ? 'primary'
        : this.matchColor || defaultColors.value.color;
    },

    textColor() {
      return (this.char === 'ENTER' && this.canSubmit === true) || this.matchColor !== undefined
        ? 'w-mode-dark'
        : defaultColors.value.textColor;
    },

    label() {
      return this.$t('keyboard.btn_keyboard', [this.char]);
    },
  },

  methods: {
    onClick() {
      this.$emit('click', this.char);
    },
  },
});
</script>
