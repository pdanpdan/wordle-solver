<template>
  <div class="fixed-full q-pb-sm column no-wrap items-center">
    <div class="full-width col column no-wrap items-center" style="max-width: 1024px; background-color: rgba(90, 90, 90, .01)">
      <div class="q-py-xs row no-wrap items-center q-gutter-x-md">
        <q-btn
          v-bind="defaultColors"
          flat
          round
          dense
          size="14px"
          icon="help_center"
          @click="onShowHelp"
        />

        <q-btn
          v-bind="defaultColors"
          unelevated
          size="14px"
          padding="2px 16px"
          @click="resetSolver()"
        >
          <div>{{ $t('solver.reset') }}</div>
        </q-btn>

        <q-btn
          v-bind="defaultColors"
          unelevated
          size="14px"
          padding="2px 16px"
          @click="hardMode = hardMode !== true"
        >
          <div style="min-width: 6em">{{ hardMode === true ? 'Hard mode' : 'Easy mode' }}</div>
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

      <div class="q-my-sm row no-wrap items-center q-gutter-x-sm">
        <q-btn
          v-for="i in 5"
          :key="i"
          outline
          size="28px"
          padding="2px"
          :color="defaultColors.color"
          :text-color="guessTargetColor"
          disable
        >
          <div v-for="(letter, j) in guessTargetOptions[i - 1]" :key="j" class="w-target__suggestion">{{ letter }}</div>
          <div style="min-width: 1.715em">{{ target[i - 1] || '?' }}</div>
        </q-btn>

        <q-btn
          class="q-ml-md"
          flat
          round
          dense
          size="14px"
          :icon="targetEdit === true ? 'send' : 'edit'"
          :color="targetEdit === true && guessTargetValid === true ? 'primary' : undefined"
          @click="onChangeTarget()"
        />
      </div>

      <q-separator v-if="targetEdit !== true" class="full-width"/>

      <q-scroll-area v-if="targetEdit !== true" class="col full-width">
        <div class="column no-wrap items-center">
          <div
            v-for="(guessItem, j) in guessesVisible"
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

          <div v-if="guessSolved !== true && solution.list.length > 0" class="q-mt-sm row no-wrap items-center q-gutter-x-sm">
            <q-btn
              v-for="i in 5"
              :key="i"
              unelevated
              size="28px"
              padding="2px"
              :color="mapColors(guess.colors[i - 1]) || defaultColors.color"
              :text-color="mapColors(guess.colors[i - 1]) ? 'white' : defaultColors.textColor"
              :disable="guessTargetValid === true || i - 1 >= guessLettersLength"
              @click="onToggleColor(i - 1)"
            >
              <div style="min-width: 1.715em">{{ guess.letters[i - 1] || '&nbsp;' }}</div>
              <q-badge
                v-if="guessColorsConflicts[i - 1]"
                color="negative"
                rounded
                floating
              />
            </q-btn>

            <q-btn
              class="q-ml-md"
              flat
              round
              dense
              size="14px"
              icon="send"
              color="primary"
              :disable="guessLettersValid !== true || guessColorsValid !== true"
              @click="addGuess"
            />
          </div>

          <q-separator class="full-width" spaced />

          <template v-if="solution.words.length > 0">
            <div class="row text-subtitle2 text-center">
              {{ $t('solver.guesses', [guessesLength]) }}
              <q-separator vertical spaced />
              {{ $t('solver.suggested_words', [solution.words.length]) }}
            </div>
            <div class="q-pa-sm">
              <div class="row items-center justify-center q-gutter-md">
                <q-btn
                  v-for="(word, i) in solution.words"
                  :key="i"
                  v-bind="defaultColors"
                  unelevated
                  padding="4px 12px"
                  :disable="word === guessLetters || guessSolved === true || solution.list.length === 0"
                  @click="onSelectNextGuess(word)"
                >
                  <div style="min-width: 5em">{{ word }}</div>
                </q-btn>
              </div>
            </div>
          </template>

          <div class="text-subtitle2 text-center">
            {{ $t('solver.matching_words', [solution.list.length]) }}
          </div>
          <div v-if="solution.list.length > 0" class="q-pa-sm">
            <div class="row items-center justify-center q-gutter-sm">
              <q-btn
                v-for="(word, i) in solution.list.slice(0, 50)"
                :key="i"
                v-bind="defaultColors"
                unelevated
                padding="2px 8px"
                :disable="word === guessLetters || guessSolved === true || solution.list.length === 0"
                @click="onSelectNextGuess(word)"
              >
                <div style="min-width: 5em">{{ word }}</div>
              </q-btn>
            </div>
          </div>
        </div>
      </q-scroll-area>

      <q-space v-else />

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
              key === 'ENTER' && (
                (targetEdit === true && guessTargetValid === true)
                || (targetEdit !== true && guessLettersValid === true && guessColorsValid === true)
              )
                ? 'primary'
                : mapColors(keyboardColors[key]) || defaultColors.color
            "
            :text-color="
              (
                key === 'ENTER' && (
                  (targetEdit === true && guessTargetValid === true)
                  || (targetEdit !== true && guessLettersValid === true && guessColorsValid === true)
                )
              ) || mapColors(keyboardColors[key])
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
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import HelpComponent from 'components/Help.vue';
import { wordleSolver, wordleChecker } from '../lib/wordle-solver.js';

const letterRe = /^[a-z]$/i;

function createGuess() {
  return {
    letters: Array(5).fill(''),
    colors: Array(5).fill('x'),
    processing: false,
  };
}

function createSolution(solution) {
  const sol = {
    words: [],
    list: [],
  };

  if (solution === Object(solution)) {
    if (Array.isArray(solution.words) === true) {
      sol.words = solution.words;
    } else if (typeof solution.word === 'string') {
      sol.words = [solution.word];
    }

    if (Array.isArray(solution.list) === true) {
      sol.list = solution.list;
    }
  }

  return sol;
}

function createTarget(word) {
  const target = Array(5).fill('');

  if (typeof word === 'string') {
    for (let i = 0; i < 5; i += 1) {
      target[i] = letterRe.test(word[i]) === true ? word[i].toLowerCase() : '';
    }
  }

  return target;
}

export default defineComponent({
  name: 'PageIndex',

  data() {
    return {
      hardMode: false,
      target: createTarget(),
      targetEdit: false,
      guesses: [],
      guess: createGuess(),
      solution: createSolution(),
    };
  },

  computed: {
    guessesVisible() {
      return this.guess.processing === true
        ? this.guessesBackup
        : this.guesses;
    },

    guessesLength() {
      return this.guessesVisible.length;
    },

    guessLetters() {
      return this.guess.letters.join('');
    },

    guessLettersLength() {
      return this.guessLetters.length;
    },

    guessLettersValid() {
      return this.guessLettersLength > 4
        && this.solver !== undefined
        && this.solver.isValidWord(this.guessLetters);
    },

    guessColorsConflicts() {
      const conflicts = Array(5).fill(false);
      const { letters, colors } = this.guess;

      for (let i = 0; i < 5; i += 1) {
        if (letters[i] !== '') {
          if (colors[i] === 'g') {
            if (this.guesses.findIndex((guess) => (
              (guess.letters[i] === letters[i] && guess.colors[i] !== 'g')
              || (guess.letters[i] !== letters[i] && guess.colors[i] === 'g')
            )) > -1) {
              conflicts[i] = true;
            }
          } else if (colors[i] === 'y') {
            if (this.guesses.findIndex((guess) => (
              guess.letters[i] === letters[i] && guess.colors[i] !== 'y'
            )) > -1) {
              conflicts[i] = true;
            }
          } else if (this.guesses.findIndex((guess) => (
            guess.letters[i] === letters[i] && (guess.colors[i] === 'g' || guess.colors[i] === 'y')
          )) > -1) {
            conflicts[i] = true;
          }
        }
      }

      return conflicts;
    },

    guessColorsValid() {
      return this.guessColorsConflicts.indexOf(true) === -1;
    },

    guessTarget() {
      return this.target.join('');
    },

    guessTargetLength() {
      return this.guessTarget.length;
    },

    guessTargetValid() {
      return this.guessTargetLength === 5
        && this.solver !== undefined
        && this.solver.isValidWord(this.guessTarget);
    },

    guessTargetOptions() {
      const arr5 = Array(5).fill(null);
      const opts = arr5.map(() => []);
      const free = arr5.map((_, i) => i).filter((i) => this.target[i] === '');

      if (free.length > 0) {
        this.guesses.forEach(({ letters, colors }) => {
          for (let i = 0; i < 5; i += 1) {
            if (colors[i] === 'y') {
              free.forEach((j) => {
                if (j !== i && opts[j].indexOf(letters[i]) === -1) {
                  opts[j].push(letters[i]);
                }
              });
            }
          }
        });

        this.guesses.forEach(({ letters, colors }) => {
          for (let i = 0; i < 5; i += 1) {
            if (colors[i] !== 'g' && opts[i].indexOf(letters[i]) > -1) {
              opts[i] = opts[i].filter((l) => l !== letters[i]);
            }
          }
        });
      }

      return opts;
    },

    guessTargetColor() {
      if (this.guessTargetValid === true) {
        return 'positive';
      }

      if (this.guessTargetLength > 0 && (this.targetEdit !== true || this.guessTargetLength > 4)) {
        return 'negative';
      }

      return this.targetEdit !== true
        ? 'grey-6'
        : this.defaultColors.textColor;
    },

    guessSolved() {
      const { guessesLength } = this;

      if (guessesLength === 0) {
        return false;
      }

      const guess = this.guesses[guessesLength - 1];

      return this.guessTarget === guess.letters.join('') || guess.colors.join('') === 'ggggg';
    },

    keyboardColors() {
      const keys = {};

      if (this.targetEdit !== true) {
        this.guesses.forEach(({ letters, colors }) => {
          for (let i = 0; i < 5; i += 1) {
            const letter = letters[i];
            const color = colors[i];

            if (keys[letter] === undefined || color === 'g') {
              keys[letter] = color === 'x' ? 'b' : color;
            }
          }
        });
      }

      return keys;
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
      this.resetSolver(true);
    },

    guessLetters() {
      if (this.solution.list.length === 1 && this.solution.list[0] === this.guessLetters) {
        for (let i = 0; i < 5; i += 1) {
          this.guess.colors[i] = 'g';
        }

        return;
      }

      const usedLetters = { ...this.keyboardColors };
      const iMax = this.guessLettersLength;

      for (let i = 0; i < iMax; i += 1) {
        const letter = this.guess.letters[i];

        if (this.guesses.findIndex(({ letters, colors }) => letters[i] === letter && colors[i] === 'g') > -1) {
          this.guess.colors[i] = 'g';
          usedLetters[letter] = undefined;
        } else if (usedLetters[letter] === 'b') {
          this.guess.colors[i] = 'b';
          usedLetters[letter] = undefined;
        }
      }

      for (let i = 0; i < iMax; i += 1) {
        const letter = this.guess.letters[i];

        if (usedLetters[letter] !== undefined && this.guess.colors[i] !== 'g') {
          this.guess.colors[i] = 'y';
          usedLetters[letter] = undefined;
        }
      }
    },

    guessTarget() {
      this.checker = this.guessTargetValid === true
        ? wordleChecker(this.guessTarget)
        : undefined;
    },
  },

  methods: {
    resetSolver(keepTarget) {
      this.guessesBackup = this.guesses.slice();

      this.guesses = [];
      this.guess = createGuess();

      if (keepTarget !== true) {
        this.target = createTarget();
      }

      this.solver = wordleSolver(this.hardMode);

      this.solution = createSolution(this.solver.getCurrentSolution());
    },

    undoSolver(index) {
      if (index < 0 || index >= this.guessesLength) {
        return;
      }

      this.guess = this.guesses[index];
      this.guesses = this.guesses.slice(0, index);
      this.solver.rewind(index);

      this.solution = createSolution(this.solver.getCurrentSolution());

      if (this.guessTargetLength < 5) {
        for (let i = 0; i < 5; i += 1) {
          this.target[i] = '';
        }

        this.guesses.forEach(({ letters, colors }) => {
          for (let i = 0; i < 5; i += 1) {
            if (colors[i] === 'g') {
              this.target[i] = letters[i];
            }
          }
        });
      }
    },

    addGuess() {
      if (this.guessLettersValid !== true || this.guessColorsValid !== true) {
        return;
      }

      const { letters, colors } = this.guess;

      if (this.checker !== undefined) {
        const result = this.checker(this.guessLetters);

        for (let i = 0; i < 5; i += 1) {
          colors[i] = result[i];
        }
      }

      this.guessesBackup = this.guesses.slice();
      this.guess.processing = true;

      this.solver
        .solve(colors.join(''), this.guessLetters)
        .then((solution) => {
          this.solution = createSolution(solution);

          this.guesses.push({
            letters,
            colors,
          });

          if (this.guessTargetLength < 5) {
            for (let i = 0; i < 5; i += 1) {
              if (this.target[i] === '' && colors[i] === 'g') {
                this.target[i] = letters[i];
              }
            }
          }

          this.guess = createGuess();
        });
    },

    onKeyPress(key) {
      if (key === 'BS') {
        if (this.targetEdit === true) {
          if (this.guessTargetLength > 0) {
            this.target[this.guessTargetLength - 1] = '';
          }
        } else if (this.guessLettersLength > 0) {
          this.guess.colors[this.guessLettersLength - 1] = 'x';
          this.guess.letters[this.guessLettersLength - 1] = '';
        }

        return;
      }

      if (key === 'ENTER') {
        if (this.targetEdit === true) {
          this.onChangeTarget();
        } else {
          this.addGuess();
        }

        return;
      }

      if (this.targetEdit === true) {
        if (this.guessTargetLength < 5) {
          this.target[this.guessTargetLength] = key;
        }
      } else if (this.guessLettersLength < 5) {
        this.guess.letters[this.guessLettersLength] = key;
        this.guess.colors[this.guessLettersLength] = 'x';
      }
    },

    onToggleColor(index) {
      if (index >= this.guessLettersLength) {
        return;
      }

      const color = this.guess.colors[index];

      // eslint-disable-next-line no-nested-ternary
      this.guess.colors[index] = color === 'g'
        ? 'b'
        : (color === 'y' ? 'g' : 'y');
    },

    onSelectNextGuess(word) {
      this.guess.letters = word.slice(0, 5).split('');
      this.guess.colors = Array(5).fill('x');

      this.$nextTick(() => {
        if (this.guessTargetValid === true) {
          this.addGuess();
        }
      });
    },

    onChangeTarget() {
      this.targetEdit = this.targetEdit !== true;

      if (this.targetEdit !== true) {
        this.resetSolver(true);
      }
    },

    onShowHelp() {
      this.$q.dialog({
        component: HelpComponent,
      });
    },

    mapColors(color, forceUnmatch) {
      if (color === 'g') {
        return 'green';
      }
      if (color === 'y') {
        return 'orange';
      }
      return color === 'b' || forceUnmatch === true ? 'grey-7' : undefined;
    },
  },

  created() {
    this.keyboardLayout = [
      'qwertyuiop'.split(''),
      'asdfghjkl'.split(''),
      ['ENTER'].concat('zxcvbnm'.split('')).concat('BS'),
    ];

    this.resetSolver();
  },

  mounted() {
    this.darkMode = this.$q.localStorage.getItem('darkMode');
  },
});
</script>
