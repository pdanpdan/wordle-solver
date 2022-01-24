<template>
  <div class="fixed-full q-pa-md column no-wrap q-gutter-y-md items-center">
    <div class="row no-wrap items-center justify-center q-gutter-x-md">
      <q-btn
        size="17px"
        padding="2px 16px"
        label="Reset"
        @click="resetSolver"
      />

      <q-toggle v-model="hardMode" label="Hard mode" />
    </div>

    <div
      v-for="(guessItem, j) in guesses"
      :key="j"
      class="row no-wrap items-center q-gutter-x-md"
    >
      <q-btn
        v-for="i in 5"
        :key="i"
        size="24px"
        padding="4px"
        :color="mapColors(guessItem.colors[i - 1], true)"
        disable
      >
        <div style="min-width: 1.715em">{{ guessItem.letters[i - 1] || '&nbsp;' }}</div>
      </q-btn>

      <q-btn
        flat
        size="17px"
        padding="11px"
        icon="undo"
        @click="undoSolver(j)"
      />
    </div>

    <div class="row no-wrap items-center q-gutter-x-md">
      <q-btn
        v-for="i in 5"
        :key="i"
        size="24px"
        padding="4px"
        :color="mapColors(guess.colors[i - 1])"
        :disable="i - 1 >= guess.cursorIndex"
        @click="onToggleColor(i - 1)"
      >
        <div style="min-width: 1.715em">{{ guess.letters[i - 1] || '&nbsp;' }}</div>
      </q-btn>

      <q-btn
        flat
        size="17px"
        padding="11px"
        icon="send"
        color="primary"
        :disable="guess.cursorIndex <= 4"
        @click="addGuess"
      />
    </div>

    <div>
      <div class="text-subtitle2 text-center q-mb-sm">
        Next guess with best score ({{ solution.score }})
      </div>

      <div class="row items-center justify-center q-gutter-md">
        <q-btn
          v-for="(word, i) in solution.words"
          :key="i"
          padding="4px 12px"
          :disable="word === guess.letters.join('')"
          @click="onSelectNextGuess(word)"
        >
          <div style="min-width: 5em">{{ word }}</div>
        </q-btn>
      </div>
    </div>

    <div class="col q-pa-md scroll">
      <div class="text-subtitle2 text-center q-mb-sm">
        Matching words ({{ solution.list.length }})
      </div>

      <div class="row items-center justify-center q-gutter-sm">
        <q-btn
          v-for="(word, i) in solution.list.slice(0, 35)"
          :key="i"
          padding="2px 8px"
          :disable="word === guess.letters.join('')"
          @click="onSelectNextGuess(word)"
        >
          <div style="min-width: 5em">{{ word }}</div>
        </q-btn>
      </div>
    </div>

    <q-space />

    <q-linear-progress
      v-if="guess.processing"
      class="q-mt-md"
      indeterminate
      color="info"
      size="8px"
    />

    <div class="column no-wrap q-gutter-y-md items-center">
      <div v-for="(row, i) in keyboardLayout" :key="i" class="row no-wrap q-gutter-x-sm">
        <q-btn
          v-for="(key, j) in row"
          :key="j"
          padding="6px"
          :color="key === 'ENTER' && guess.cursorIndex > 4 ? 'primary' : keyboardColors[key]"
          @click="onKeyPress(key)"
        >
          <div style="min-width: 1.4em">{{ key }}</div>
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
  },

  watch: {
    hardMode() {
      this.undoSolver(this.guesses.length);
    },
  },

  methods: {
    resetSolver() {
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
        }, 100);
      });
    },

    undoSolver(index) {
      const guesses = this.guesses.slice(0, index);
      const originalGuess = this.guess;

      guesses
        .reduce((q, guess) => q.then(() => {
          this.guess = guess;
          return this.addGuess();
        }), this.resetSolver())
        .then(() => {
          this.guess = originalGuess;
        });
    },

    addGuess() {
      if (this.guess.letters.length !== 5) {
        return Promise.resolve();
      }

      const { letters, colors } = this.guess;
      this.guess.processing = true;

      return new Promise((resolve) => {
        setTimeout(() => {
          this.guesses.push({
            letters,
            colors,
          });

          this.solution = createSolution(this.solver(letters.join(''), colors.join('')));

          this.guess = createGuess();

          letters.forEach((letter, i) => {
            const color = colors[i];

            if (this.keyboardColors[letter] === undefined || color === 'G') {
              this.keyboardColors[letter] = this.mapColors(color, true);
            }
          });

          resolve();
        }, 100);
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
      return color === 'G' ? 'green' : (color === 'Y' ? 'orange' : (color === 'B' || forceBlack === true ? 'dark' : undefined));
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
});
</script>
