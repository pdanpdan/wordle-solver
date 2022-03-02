<template>
  <div class="q-mt-sm row no-wrap items-center q-gutter-x-sm">
    <q-btn
      v-for="i in WORD_SIZE"
      :key="i"
      unelevated
      size="28px"
      padding="2px"
      :color="guessMatchColors[i - 1]"
      disable
    >
      <div style="min-width: 1.715em">{{ guessLetters[i - 1] }}</div>
    </q-btn>

    <q-btn
      class="q-ml-md"
      v-bind="defaultColors"
      round
      unelevated
      size="md"
      padding="sm"
      icon="undo"
      :aria-label="$t('guess.btn_undo')"
      @click="onUndo"
    />
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { WORD_SIZE, getMatchColor } from 'lib/solver/wordle-solver.js';
import { defaultColors } from 'lib/store';

export default defineComponent({
  name: 'GuessHistoryItemComponent',

  props: {
    guess: Object,
  },

  emits: [
    'undo',
  ],

  data() {
    return {
      WORD_SIZE,

      defaultColors,
    };
  },

  computed: {
    guessMatchColors() {
      return this.guess.matchTypes.map((matchType) => getMatchColor(matchType, true));
    },

    guessLetters() {
      return this.guess.letters.map((letter) => letter || '&nbsp;');
    },
  },

  methods: {
    onUndo() {
      this.$emit('undo', this.guess);
    },
  },
});
</script>
