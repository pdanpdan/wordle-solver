<template>
  <div class="fixed-full q-pb-sm column no-wrap items-center">
    <div class="q-py-xs row no-wrap items-center q-gutter-x-md">
      <q-btn
        v-bind="defaultColors"
        unelevated
        size="14px"
        padding="2px 16px"
        @click="resetSolver"
      >
        <div style="min-width: 7.6em">{{ $t('solver.reset') }}</div>
      </q-btn>

      <q-btn
        v-bind="defaultColors"
        unelevated
        size="14px"
        padding="2px 16px"
        @click="hardMode = hardMode !== true"
      >
        <div style="min-width: 7.6em">{{ hardMode === true ? 'Hard mode' : 'Easy mode' }}</div>
      </q-btn>

      <q-btn
        v-bind="defaultColors"
        flat
        round
        dense
        size="14px"
        :icon="darkMode === true ? 'dark_mode' : 'light_mode'"
        @click="darkMode = darkMode !== true"
      />
    </div>

    <q-separator class="full-width"/>

    <div
      v-for="(guessItem, j) in visibleGuesses"
      :key="j"
      class="q-mt-sm row no-wrap items-center q-gutter-x-sm"
    >
      <q-btn
        v-for="i in 5"
        :key="i"
        unelevated
        size="28px"
        padding="2px"
        :color="mapColors(guessItem.colors[i - 1], true)"
        disable
      >
        <div style="min-width: 1.715em">{{ guessItem.letters[i - 1] || '&nbsp;' }}</div>
      </q-btn>

      <q-btn
        class="q-ml-md"
        flat
        round
        dense
        size="14px"
        icon="undo"
        @click="undoSolver(j)"
      />
    </div>

    <div class="q-mt-sm row no-wrap items-center q-gutter-x-sm">
      <q-btn
        v-for="i in 5"
        :key="i"
        unelevated
        size="28px"
        padding="2px"
        :color="mapColors(guess.colors[i - 1]) || defaultColors.color"
        :text-color="mapColors(guess.colors[i - 1]) ? 'white' : defaultColors.textColor"
        :disable="i - 1 >= guess.cursorIndex"
        @click="onToggleColor(i - 1)"
      >
        <div style="min-width: 1.715em">{{ guess.letters[i - 1] || '&nbsp;' }}</div>
      </q-btn>

      <q-btn
        class="q-ml-md"
        flat
        round
        dense
        size="14px"
        icon="send"
        color="primary"
        :disable="guess.cursorIndex <= 4"
        @click="addGuess()"
      />
    </div>

    <q-separator class="full-width" spaced />

    <div class="text-subtitle2 text-center">
      {{ $t('solver.suggested_words', [solution.score.toFixed(4)]) }}
    </div>
    <div class="col q-pa-sm scroll">
      <div class="row items-center justify-center q-gutter-md">
        <q-btn
          v-for="(word, i) in solution.words"
          :key="i"
          v-bind="defaultColors"
          unelevated
          padding="4px 12px"
          :disable="word === guess.letters.join('')"
          @click="onSelectNextGuess(word)"
        >
          <div style="min-width: 5em">{{ word }}</div>
        </q-btn>
      </div>
    </div>

    <div class="text-subtitle2 text-center">
      {{ $t('solver.matching_words', [solution.list.length]) }}
    </div>
    <div class="col q-pa-sm scroll">
      <div class="row items-center justify-center q-gutter-sm">
        <q-btn
          v-for="(word, i) in solution.list.slice(0, 35)"
          :key="i"
          v-bind="defaultColors"
          unelevated
          padding="2px 8px"
          :disable="word === guess.letters.join('')"
          @click="onSelectNextGuess(word)"
        >
          <div style="min-width: 5em">{{ word }}</div>
        </q-btn>
      </div>
    </div>

    <div class="full-width relative-position">
      <q-separator spaced />

      <q-linear-progress
        v-if="guess.processing"
        class="absolute-top"
        indeterminate
        color="info"
        size="8px"
      />
    </div>

    <div class="column no-wrap q-gutter-y-md items-center">
      <div v-for="(row, i) in keyboardLayout" :key="i" class="row no-wrap q-gutter-x-xs">
        <q-btn
          v-for="(key, j) in row"
          :key="j"
          unelevated
          padding="7px"
          :color="
            key === 'ENTER' && guess.cursorIndex > 4
              ? 'primary'
              : mapColors(keyboardColors[key]) || defaultColors.color
          "
          :text-color="
            key === 'ENTER' && guess.cursorIndex > 4 || mapColors(keyboardColors[key])
              ? 'white'
              : defaultColors.textColor
          "
          @click="onKeyPress(key)"
        >
          <q-icon v-if="key === 'BS'" class="q-pr-xs" name="backspace" />
          <q-icon v-else-if="key === 'ENTER'" class="q-pl-sm q-pr-xs" name="send" />
          <div v-else style="min-width: 1.4em">{{ key }}</div>
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import wordleSolver from '../lib/wordle-solver.js';

function createGuess() {
  return {
    cursorIndex: 0,
    letters: [],
    colors: Array(5).fill('X'),
    processing: false,
  };
}

function createSolution(solution) {
  return solution === Object(solution)
    ? solution
    : {
      score: 0,
      words: [],
      list: [],
    };
}

export default defineComponent({
  name: 'PageIndex',

  data() {
    return {
      hardMode: false,
      guesses: [],
      guess: createGuess(),
      solution: createSolution(),
      keyboardColors: {},
    };
  },

  computed: {
    visibleGuesses() {
      return this.guess.processing === true
        ? this.guessesBackup
        : this.guesses;
    },

    guessLetters() {
      return this.guess.letters.join('');
    },

    darkMode: {
      get() {
        return this.$q.dark.isActive;
      },

      set(val) {
        this.$q.dark.set(val === true);
        this.$q.localStorage.set('darkMode', this.$q.dark.isActive);
      },
    },

    defaultColors() {
      return this.darkMode === true
        ? {
          color: 'grey-10',
          textColor: 'white',
        }
        : {
          color: 'grey-3',
          textColor: 'dark',
        };
    },
  },

  watch: {
    hardMode() {
      this.undoSolver(this.guesses.length);
    },

    guessLetters() {
      const usedLetters = { ...this.keyboardColors };
      const iMax = this.guess.letters.length;

      for (let i = 0; i < iMax; i += 1) {
        const letter = this.guess.letters[i];

        if (this.guesses.findIndex(({ letters, colors }) => letters[i] === letter && colors[i] === 'G') > -1) {
          this.guess.colors[i] = 'G';
          usedLetters[letter] = undefined;
        } else if (usedLetters[letter] === 'B') {
          this.guess.colors[i] = 'B';
          usedLetters[letter] = undefined;
        }
      }

      for (let i = 0; i < iMax; i += 1) {
        const letter = this.guess.letters[i];

        if (usedLetters[letter] !== undefined) {
          this.guess.colors[i] = 'Y';
          usedLetters[letter] = undefined;
        }
      }
    },
  },

  methods: {
    resetSolver() {
      this.guessesBackup = this.guesses.slice();

      this.guesses = [];
      this.guess = createGuess();
      this.keyboardColors = {};

      this.solver = wordleSolver(this.hardMode);
      this.guess.processing = true;

      return new Promise((resolve) => {
        setTimeout(() => {
          this.solution = createSolution(this.solver());
          this.guess.processing = false;
          resolve();
        }, 0);
      });
    },

    undoSolver(index) {
      const guesses = this.guesses.slice(0, index);
      const originalGuess = index === this.guesses.length
        ? this.guess
        : this.guesses[index];

      guesses
        .reduce((q, guess) => q.then(() => this.addGuess(guess)), this.resetSolver())
        .then(() => {
          this.guess = originalGuess;
        });
    },

    addGuess(guess = this.guess) {
      const { letters, colors } = guess;

      if (letters.length !== 5) {
        return Promise.resolve();
      }

      if (this.guess === guess) {
        this.guessesBackup = this.guesses.slice();
      }
      this.guess.processing = true;

      return new Promise((resolve) => {
        setTimeout(() => {
          this.guesses.push({
            letters,
            colors,
          });

          if (this.guess === guess) {
            this.guess = createGuess();
          }

          this.solution = createSolution(this.solver(letters.join(''), colors.join('')));

          letters.forEach((letter, i) => {
            const color = colors[i];

            if (this.keyboardColors[letter] === undefined || color === 'G') {
              this.keyboardColors[letter] = color === 'X' ? 'B' : color;
            }
          });

          resolve();
        }, 0);
      });
    },

    onKeyPress(key) {
      if (key === 'BS') {
        if (this.guess.cursorIndex > 0) {
          this.guess.cursorIndex -= 1;
          this.guess.letters = this.guess.letters.slice(0, this.guess.cursorIndex);
          this.guess.colors[this.guess.cursorIndex] = 'X';
        }

        return;
      }

      if (key === 'ENTER') {
        this.addGuess();

        return;
      }

      if (this.guess.cursorIndex < 5) {
        this.guess.letters[this.guess.cursorIndex] = key;
        this.guess.colors[this.guess.cursorIndex] = 'X';
        this.guess.cursorIndex += 1;
      }
    },

    onToggleColor(cursorIndex) {
      if (cursorIndex >= this.guess.cursorIndex) {
        return;
      }

      let color = this.guess.colors[cursorIndex];

      if (color === 'G') {
        color = 'B';
      } else if (color === 'Y') {
        color = 'G';
      } else {
        color = 'Y';
      }

      this.guess.colors[cursorIndex] = color;
    },

    onSelectNextGuess(word) {
      this.guess.letters = word.slice(0, 5).split('');
      this.guess.colors = Array(5).fill('X');
      this.guess.cursorIndex = 5;
    },

    mapColors(color, forceBlack) {
      if (color === 'G') {
        return 'green';
      }
      if (color === 'Y') {
        return 'orange';
      }
      return color === 'B' || forceBlack === true ? 'grey-7' : undefined;
    },
  },

  created() {
    this.keyboardLayout = [
      'QWERTYUIOP'.split(''),
      'ASDFGHJKL'.split(''),
      ['ENTER'].concat('ZXCVBNM'.split('')).concat('BS'),
    ];

    this.colors = 'YGB'.split('');

    this.resetSolver();
  },

  mounted() {
    this.darkMode = this.$q.localStorage.getItem('darkMode');
  },
});
</script>
