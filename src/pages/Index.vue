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
          :aria-label="$t('solver.btn_help')"
          @click="onShowHelp"
        />

        <q-btn
          v-bind="defaultColors"
          unelevated
          size="14px"
          padding="2px 16px"
          :aria-label="$t('solver.btn_reset_solver')"
          @click="resetSolver()"
        >
          <div>{{ $t('solver.reset') }}</div>
        </q-btn>

        <q-btn
          v-bind="defaultColors"
          unelevated
          size="14px"
          padding="2px 16px"
          :aria-label="hardMode === true ? $t('solver.btn_to_easy_mode') : $t('solver.btn_to_hard_mode')"
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
          :aria-label="darkMode === true ? $t('solver.btn_to_light_mode') : $t('solver.btn_to_dark_mode')"
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
          :icon="targetMode === true ? 'send' : 'edit'"
          :color="targetMode === true && guessTargetValid === true ? 'primary' : undefined"
          :aria-label="targetMode === true ? $t('solver.btn_save_target') : $t('solver.btn_edit_target')"
          @click="onChangeTarget()"
        />
      </div>

      <q-separator v-if="targetMode !== true" class="full-width"/>

      <q-scroll-area v-if="targetMode !== true" class="col full-width">
        <div class="column no-wrap items-center">
          <w-guess-history-item
            v-for="(guess, j) in guessesVisible"
            :key="j"
            :guess="guess"
            @undo="undoSolver(j)"
          />

          <div v-if="guessSolved !== true && solution.list.length > 0" class="q-mt-sm row no-wrap items-center q-gutter-x-sm">
            <q-btn
              v-for="i in 5"
              :key="i"
              unelevated
              size="28px"
              padding="2px"
              :color="mapColors(guess.matchTypes[i - 1]) || defaultColors.color"
              :text-color="mapColors(guess.matchTypes[i - 1]) ? 'white' : defaultColors.textColor"
              :disable="guessTargetValid === true || i - 1 >= guessLettersLength"
              :aria-label="$t('solver.btn_change_color', [guess.letters[i - 1] || '&nbsp;', nextColorMatchType(guess.matchTypes[i - 1])])"
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
              :aria-label="$t('solver.btn_add_guess')"
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
                <w-solution-word
                  v-for="(props, i) in solutionWordsProps"
                  :key="i"
                  v-bind="props"
                  @click="onSelectNextGuess"
                />
              </div>
            </div>
          </template>

          <div class="text-subtitle2 text-center">
            {{ $t('solver.matching_words', [solution.list.length]) }}
          </div>
          <div v-if="solution.list.length > 0" class="q-pa-sm">
            <div class="row items-center justify-center q-gutter-sm">
              <w-solution-word
                v-for="(props, i) in solutionListProps"
                :key="i"
                v-bind="props"
                @click="onSelectNextGuess"
              />
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
          color="primary"
          size="8px"
        />
      </div>

      <w-keyboard
        :can-submit="canSubmit"
        @click="onKeyPress"
      />
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import WHelp from 'components/Help.vue';
import WKeyboard from 'components/Keyboard.vue';
import WGuessHistoryItem from 'components/GuessHistoryItem.vue';
import WSolutionWord from 'components/SolutionWord.vue';
import { getMatchColor, wordleChecker, wordleSolver } from 'lib/solver/wordle-solver.js';
import {
  darkMode,
  hardMode,
  targetMode,

  defaultColors,

  guesses,
  charsMatchType,
} from 'lib/store';

const letterRe = /^[a-z]$/i;

function createGuess() {
  return {
    letters: Array(5).fill(''),
    matchTypes: Array(5).fill('x'),
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

  components: {
    WGuessHistoryItem,
    WKeyboard,
    WSolutionWord,
  },

  data() {
    return {
      darkMode,
      hardMode,

      targetMode,
      target: createTarget(),

      guesses,
      guess: createGuess(),
      solution: createSolution(),

      defaultColors,
      charsMatchType,
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
      const { letters, matchTypes } = this.guess;

      for (let i = 0; i < 5; i += 1) {
        if (letters[i] !== '') {
          if (matchTypes[i] === 'g') {
            if (this.guesses.findIndex((guess) => (
              (guess.letters[i] === letters[i] && guess.matchTypes[i] !== 'g')
              || (guess.letters[i] !== letters[i] && guess.matchTypes[i] === 'g')
            )) > -1) {
              conflicts[i] = true;
            }
          } else if (matchTypes[i] === 'y') {
            if (this.guesses.findIndex((guess) => (
              guess.letters[i] === letters[i] && guess.matchTypes[i] !== 'y'
            )) > -1) {
              conflicts[i] = true;
            }
          } else if (this.guesses.findIndex((guess) => (
            guess.letters[i] === letters[i] && (guess.matchTypes[i] === 'g' || guess.matchTypes[i] === 'y')
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
        this.guesses.forEach(({ letters, matchTypes }) => {
          for (let i = 0; i < 5; i += 1) {
            if (matchTypes[i] === 'y') {
              free.forEach((j) => {
                if (j !== i && opts[j].indexOf(letters[i]) === -1) {
                  opts[j].push(letters[i]);
                }
              });
            }
          }
        });

        this.guesses.forEach(({ letters, matchTypes }) => {
          for (let i = 0; i < 5; i += 1) {
            if (matchTypes[i] !== 'g' && opts[i].indexOf(letters[i]) > -1) {
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

      if (this.guessTargetLength > 0 && (this.targetMode !== true || this.guessTargetLength > 4)) {
        return 'negative';
      }

      return this.targetMode !== true
        ? 'grey-6'
        : this.defaultColors.textColor;
    },

    guessSolved() {
      const { guessesLength } = this;

      if (guessesLength === 0) {
        return false;
      }

      const guess = this.guesses[guessesLength - 1];

      return this.guessTarget === guess.letters.join('') || guess.matchTypes.join('') === 'ggggg';
    },

    canSubmit() {
      return (this.targetMode === true && this.guessTargetValid === true)
        || (this.targetMode !== true && this.guessLettersValid === true && this.guessColorsValid === true);
    },

    solutionWordsProps() {
      const solutionListEmpty = this.solution.list.length === 0;

      return this.solution.words.map((word) => ({
        word,
        disable: this.guessSolved === true || word === this.guessLetters || solutionListEmpty === true,
      }));
    },

    solutionListProps() {
      const listLength = this.solution.list.length;
      let list;

      if (listLength <= 30) {
        list = this.solution.list;
      } else {
        list = this.solution.list.slice(0, 29).concat(`... ${ listLength - 30 }`);
      }

      return list.map((word) => ({
        word,
        disable: this.guessSolved === true || word === this.guessLetters || word[0] === '.',
      }));
    },
  },

  watch: {
    hardMode() {
      this.$nextTick(() => {
        this.resetSolver(true);
      });
    },

    guessLetters() {
      if (this.solution.list.length === 1 && this.solution.list[0] === this.guessLetters) {
        for (let i = 0; i < 5; i += 1) {
          this.guess.matchTypes[i] = 'g';
        }

        return;
      }

      const usedLetters = { ...this.charsMatchType };
      const iMax = this.guessLettersLength;

      for (let i = 0; i < iMax; i += 1) {
        const letter = this.guess.letters[i];

        if (this.guesses.findIndex(({ letters, matchTypes }) => letters[i] === letter && matchTypes[i] === 'g') > -1) {
          this.guess.matchTypes[i] = 'g';
          usedLetters[letter] = undefined;
        } else if (usedLetters[letter] === 'b') {
          this.guess.matchTypes[i] = 'b';
          usedLetters[letter] = undefined;
        }
      }

      for (let i = 0; i < iMax; i += 1) {
        const letter = this.guess.letters[i];

        if (usedLetters[letter] !== undefined && this.guess.matchTypes[i] !== 'g') {
          this.guess.matchTypes[i] = 'y';
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

        this.guesses.forEach(({ letters, matchTypes }) => {
          for (let i = 0; i < 5; i += 1) {
            if (matchTypes[i] === 'g') {
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

      const { letters, matchTypes } = this.guess;

      if (this.checker !== undefined) {
        const result = this.checker(this.guessLetters);

        for (let i = 0; i < 5; i += 1) {
          matchTypes[i] = result[i];
        }
      }

      this.guessesBackup = this.guesses.slice();
      this.guess.processing = true;

      this.solver
        .solve(matchTypes.join(''), this.guessLetters)
        .then((solution) => {
          this.solution = createSolution(solution);

          this.guesses.push({
            letters,
            matchTypes,
          });

          if (this.guessTargetLength < 5) {
            for (let i = 0; i < 5; i += 1) {
              if (this.target[i] === '' && matchTypes[i] === 'g') {
                this.target[i] = letters[i];
              }
            }
          }

          this.guess = createGuess();
        });
    },

    onKeyPress(key) {
      if (key === 'BS') {
        if (this.targetMode === true) {
          if (this.guessTargetLength > 0) {
            this.target[this.guessTargetLength - 1] = '';
          }
        } else if (this.guessLettersLength > 0) {
          this.guess.matchTypes[this.guessLettersLength - 1] = 'x';
          this.guess.letters[this.guessLettersLength - 1] = '';
        }

        return;
      }

      if (key === 'ENTER') {
        if (this.targetMode === true) {
          this.onChangeTarget();
        } else {
          this.addGuess();
        }

        return;
      }

      if (this.targetMode === true) {
        if (this.guessTargetLength < 5) {
          this.target[this.guessTargetLength] = key;
        }
      } else if (this.guessLettersLength < 5) {
        this.guess.letters[this.guessLettersLength] = key;
        this.guess.matchTypes[this.guessLettersLength] = 'x';
      }
    },

    onToggleColor(index) {
      if (index >= this.guessLettersLength) {
        return;
      }

      const color = this.guess.matchTypes[index];

      // eslint-disable-next-line no-nested-ternary
      this.guess.matchTypes[index] = color === 'g'
        ? 'b'
        : (color === 'y' ? 'g' : 'y');
    },

    onSelectNextGuess(word) {
      this.guess.letters = word.slice(0, 5).split('');
      this.guess.matchTypes = Array(5).fill('x');

      this.$nextTick(() => {
        if (this.guessTargetValid === true) {
          this.addGuess();
        }
      });
    },

    onChangeTarget() {
      this.targetMode = this.targetMode !== true;

      if (this.targetMode !== true) {
        this.resetSolver(true);
      }
    },

    onShowHelp() {
      this.$q.dialog({
        component: WHelp,
      });
    },

    mapColors(color, forceUnmatch) {
      return getMatchColor(color, forceUnmatch);
    },

    nextColorMatchType(color) {
      if (color === 'g') {
        return this.$t('solver.type_not_present');
      }

      return color === 'y'
        ? this.$t('solver.type_in_place')
        : this.$t('solver.type_not_in_place');
    },
  },

  created() {
    this.resetSolver();
  },
});
</script>
