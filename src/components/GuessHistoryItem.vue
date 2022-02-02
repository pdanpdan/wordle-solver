<template>
  <div class="q-mt-sm row no-wrap items-center q-gutter-x-sm">
    <q-btn
      v-for="i in 5"
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
      flat
      round
      dense
      size="14px"
      icon="undo"
      :aria-label="$t('guess.btn_undo')"
      @click="onUndo"
    />
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { getMatchColor } from 'lib/solver/wordle-solver';

export default defineComponent({
  name: 'GuessHistoryItemComponent',

  props: {
    guess: Object,
  },

  emits: [
    'undo',
  ],

  computed: {
    guessMatchColors() {
      return this.guess.colors.map((matchType) => getMatchColor(matchType, true));
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
