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
          :class="{ 'w-letter--active': targetMode === true && guessTargetLength === i - 1 }"
          outline
          size="28px"
          padding="2px"
          :color="defaultColors.color"
          :text-color="guessTargetColor"
          disable
        >
          <div v-if="playMode === true" style="min-width: 1.715em">?</div>

          <div v-else-if="targetMode === true" style="min-width: 1.715em">{{ target[i - 1] || '&nbsp;' }}</div>

          <template v-else>
            <div v-for="(letter, j) in guessTargetOptions[i - 1].opts" :key="j" class="w-target__suggestion">{{ letter }}</div>
            <div style="min-width: 1.715em">{{ guessTargetOptions[i - 1].target || '?' }}</div>
          </template>
        </q-btn>

        <q-btn
          class="q-ml-md"
          flat
          round
          dense
          size="14px"
          :icon="targetMode === true ? 'send' : (playMode === true ? 'visibility' : 'edit')"
          :color="targetMode === true && canSubmit === true ? 'primary' : undefined"
          :aria-label="targetMode === true ? $t('solver.btn_save_target') : $t('solver.btn_edit_target')"
          :disable="targetMode === true && canSubmit !== true"
          @click="onChangeTarget()"
        />
      </div>

      <template v-if="targetMode === true && shareUrl">
        <q-separator class="full-width"/>

        <q-input
          class="full-width q-mt-md cursor-pointer"
          :model-value="shareUrl"
          input-class="text-center cursor-pointer"
          standout
          dense
          readonly
          @click="onShareClick"
        >
          <template #append>
            <q-icon name="content_copy" @click="onShareClick"/>
          </template>
        </q-input>
      </template>

      <template v-if="targetMode !== true">
        <q-separator class="full-width"/>

        <q-scroll-area class="col full-width">
          <div class="column no-wrap items-center">
            <w-guess-history-item
              v-for="(guess, j) in guessesVisible"
              :key="j"
              :guess="guess"
              @undo="undoSolver(j)"
            />

            <div v-if="guessSolved !== true && solutionListLength > 0" class="q-mt-sm row no-wrap items-center q-gutter-x-sm">
              <q-btn
                v-for="i in 5"
                :key="i"
                :class="{ 'w-letter--active': guessLettersLength === i - 1 }"
                unelevated
                size="28px"
                padding="2px"
                v-bind="guessMatchColors[i - 1]"
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

            <q-separator class="full-width" spaced/>

            <div class="row text-subtitle2 text-center">
              {{ $t('solver.guesses', [guessesLength]) }}
              <template v-if="playMode !== true && solutionWordsLength > 0">
                <q-separator vertical spaced/>
                {{ $t('solver.suggested_words', [solutionWordsLength]) }}
              </template>
            </div>
            <div v-if="playMode !== true && solutionWordsLength > 0" class="q-pa-sm">
              <div class="row items-center justify-center q-gutter-md">
                <w-solution-word
                  v-for="(props, i) in solutionWordsProps"
                  :key="i"
                  v-bind="props"
                  @click="onSelectNextGuess"
                />
              </div>
            </div>

            <template v-if="playMode !== true">
              <div class="text-subtitle2 text-center">
                {{ $t('solver.matching_words', [solutionListLength]) }}
              </div>
              <div v-if="solutionListLength > 0" class="q-pa-sm">
                <div class="row items-center justify-center q-gutter-sm">
                  <w-solution-word
                    v-for="(props, i) in solutionListProps"
                    :key="i"
                    v-bind="props"
                    @click="onSelectNextGuess"
                  />
                </div>
              </div>
            </template>
          </div>
        </q-scroll-area>
      </template>

      <q-space v-else/>

      <div class="full-width relative-position">
        <q-separator spaced/>

        <q-linear-progress
          v-if="guess.processing"
          class="absolute-top"
          indeterminate
          color="primary"
          size="8px"
        />
      </div>

      <w-keyboard :can-submit="canSubmit" @click="onVKeyPress"/>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { copyToClipboard } from 'quasar';

import WHelp from 'components/Help.vue';
import WKeyboard from 'components/Keyboard.vue';
import WGuessHistoryItem from 'components/GuessHistoryItem.vue';
import WSolutionWord from 'components/SolutionWord.vue';

import {
  getMatchColor,
  getPlayWord,
  getPlayWordIndex,
  wordleChecker,
  wordleSolver,
} from 'lib/solver/wordle-solver.js';
import {
  darkMode,
  hardMode,
  targetMode,
  playMode,

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

      playMode,

      guess: createGuess(),
      solution: createSolution(),

      defaultColors,
    };
  },

  computed: {
    guessesVisible() {
      return this.guess.processing === true
        ? this.guessesBackup
        : guesses.value;
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
        const letter = letters[i];
        const letterMatchType = matchTypes[i];
        const charMatchType = charsMatchType.value[letter];

        if (letter !== '') {
          if (this.hardMode === true) {
            guesses.value.forEach((guess) => {
              if (guess.letters[i] !== letter && guess.matchTypes[i] === 'g') {
                conflicts[i] = true;
              }
            });
          }

          if (letterMatchType === 'g') {
            if (
              charMatchType === 'b'
              || guesses.value.findIndex((guess) => (
                (guess.letters[i] === letter && guess.matchTypes[i] !== 'g')
                || (guess.letters[i] !== letter && guess.matchTypes[i] === 'g')
              )) > -1
            ) {
              conflicts[i] = true;
            }
          } else if (letterMatchType === 'y') {
            if (
              charMatchType === 'b'
              || guesses.value.findIndex((guess) => (
                guess.letters[i] === letter && guess.matchTypes[i] !== 'y'
              )) > -1
            ) {
              conflicts[i] = true;
            }
          } else if (guesses.value.findIndex((guess) => (
            guess.letters[i] === letter && (guess.matchTypes[i] === 'g' || guess.matchTypes[i] === 'y')
          )) > -1) {
            conflicts[i] = true;
          }
        }
      }

      const countY = matchTypes.filter((matchType) => matchType === 'y').length;
      const countG = matchTypes.filter((matchType) => matchType === 'g').length;

      if (countY === 1 && countG === 4) {
        conflicts[matchTypes.indexOf('y')] = true;
      }

      return conflicts;
    },

    guessColorsValid() {
      let valid = this.guessColorsConflicts.indexOf(true) === -1;

      if (this.hardMode === true && valid === true) {
        const aggLetters = {};
        for (let i = 0; i < 5; i += 1) {
          if (aggLetters[this.guess.letters[i]] === undefined) {
            aggLetters[this.guess.letters[i]] = 0;
          }

          aggLetters[this.guess.letters[i]] += 1;
        }

        guesses.value.forEach(({ letters, matchTypes }) => {
          if (valid === true) {
            const aggLettersCopy = { ...aggLetters };
            for (let i = 0; valid === true && i < 5; i += 1) {
              if (matchTypes[i] === 'g' || matchTypes[i] === 'y') {
                if (aggLettersCopy[letters[i]] > 0) {
                  aggLettersCopy[letters[i]] -= 1;
                } else {
                  valid = false;
                }
              }
            }
          }
        });
      }

      return valid;
    },

    guessMatchColors() {
      return this.playMode === true
        ? this.guess.matchTypes.map(() => ({
          color: this.defaultColors.color,
          textColor: this.defaultColors.textColor,
        }))
        : this.guess.matchTypes.map((matchType) => ({
          color: getMatchColor(matchType) || this.defaultColors.color,
          textColor: getMatchColor(matchType) ? 'white' : this.defaultColors.textColor,
        }));
    },

    guessTarget() {
      return this.targetMode === true
        ? this.target.join('')
        : this.guessTargetOptions.map((obj) => obj.target).join('');
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
      const options = arr5.map((_, i) => ({ opts: [], target: this.target[i] }));
      let free = arr5.map((_, i) => i).filter((i) => options[i].target === '');

      if (free.length > 0) {
        guesses.value.forEach(({ letters, matchTypes }) => {
          free.forEach((i) => {
            if (matchTypes[i] === 'g') {
              options[i].target = letters[i];
            }
          });
        });
      }

      free = free.filter((i) => options[i].target === '');

      if (free.length > 0) {
        guesses.value.forEach(({ letters, matchTypes }) => {
          for (let i = 0; i < 5; i += 1) {
            if (charsMatchType.value[letters[i]] !== 'g' && matchTypes[i] === 'y') {
              free.forEach((j) => {
                if (j !== i && options[j].opts.indexOf(letters[i]) === -1) {
                  options[j].opts.push(letters[i]);
                }
              });
            }
          }
        });

        guesses.value.forEach(({ letters, matchTypes }) => {
          for (let i = 0; i < 5; i += 1) {
            if (matchTypes[i] !== 'g' && options[i].opts.indexOf(letters[i]) > -1) {
              options[i].opts = options[i].opts.filter((l) => l !== letters[i]);
            }
          }
        });

        const aggLetters = {};
        for (let i = 0; i < 5; i += 1) {
          const { opts } = options[i];
          opts.forEach((letter) => {
            if (aggLetters[letter] === undefined) {
              aggLetters[letter] = 0;
            }

            aggLetters[letter] += 1;
          });
        }

        Object.keys(aggLetters).forEach((letter) => {
          if (aggLetters[letter] === 1) {
            const index = options.findIndex(({ opts }) => opts.indexOf(letter) > -1);

            if (index > -1) {
              options[index].target = letter;
            }
          }
        });
      }

      return options;
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

      const guess = this.guessesVisible[guessesLength - 1];

      return this.guessTarget === guess.letters.join('') || guess.matchTypes.join('') === 'ggggg';
    },

    canSubmit() {
      return (this.targetMode === true && (this.guessTargetValid === true || this.guessTargetLength < 5))
        || (this.targetMode !== true && this.guessLettersValid === true && this.guessColorsValid === true);
    },

    solutionWordsLength() {
      return this.solution.words.length;
    },

    solutionListLength() {
      return this.solution.list.length;
    },

    solutionWordsProps() {
      const disable = this.guessSolved === true || this.solutionListLength === 0;
      const { guessLetters } = this;

      return this.solution.words.map((word) => ({
        word,
        disable: disable === true || word === guessLetters,
      }));
    },

    solutionListProps() {
      const disable = this.guessSolved === true;
      const { guessLetters } = this;

      let list;

      if (this.solutionListLength <= 30) {
        list = this.solution.list;
      } else {
        list = this.solution.list.slice(0, 29).concat(`... ${ this.solutionListLength - 29 }`);
      }

      return list.map((word) => ({
        word,
        disable: disable === true || word === guessLetters || word[0] === '.',
      }));
    },

    shareUrl() {
      if (this.guessTargetValid === true) {
        const gameId = getPlayWordIndex(this.guessTarget);

        if (gameId !== null) {
          const { href } = this.$router.resolve({
            name: 'solver',
            params: { gameId },
          });

          return `${ window.location.origin }${ href }`;
        }
      }

      return undefined;
    },
  },

  watch: {
    hardMode() {
      this.$nextTick(() => {
        this.resetSolver(true);
      });
    },

    guessLetters() {
      if (this.solutionListLength === 1 && this.solution.list[0] === this.guessLetters) {
        for (let i = 0; i < 5; i += 1) {
          this.guess.matchTypes[i] = 'g';
        }

        return;
      }

      const usedLetters = { ...charsMatchType.value };
      const iMax = this.guessLettersLength;

      for (let i = 0; i < iMax; i += 1) {
        const letter = this.guess.letters[i];

        if (guesses.value.findIndex(({ letters, matchTypes }) => letters[i] === letter && matchTypes[i] === 'g') > -1) {
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
      this.guessesBackup = guesses.value.slice();

      guesses.value = [];
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

      this.guess = guesses.value[index];
      guesses.value = guesses.value.slice(0, index);
      this.solver.rewind(index);

      this.solution = createSolution(this.solver.getCurrentSolution());
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

      this.guessesBackup = guesses.value.slice();
      this.guess.processing = true;

      this.solver
        .solve(matchTypes.join(''), this.guessLetters)
        .then((solution) => {
          this.solution = createSolution(solution);

          guesses.value.push({
            letters,
            matchTypes,
          });

          this.guess = createGuess();
        });
    },

    onKeyUp(evt) {
      if (!evt || typeof evt.key !== 'string' || evt.key.length === 0 || evt.altKey === true || evt.ctrlKey === true || evt.metaKey === true) {
        return;
      }

      const key = evt.key.toLowerCase();

      if (/^[a-z]$/.test(key) === true) {
        this.onVKeyPress(key);
        document.activeElement.blur();
      } else if (['backspace', 'delete', 'arrowleft'].indexOf(key) > -1) {
        this.onVKeyPress('BS');
        document.activeElement.blur();
      } else if (key === 'enter' && document.activeElement === document.body) {
        this.onVKeyPress('ENTER');
      } else if (key === '?') {
        this.onShowHelp();
      }
    },

    onVKeyPress(key) {
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
      const guessTarget = this.target.join('|');
      this.targetMode = this.targetMode !== true;

      if (this.targetMode !== true) {
        if (this.guessTargetPrev !== guessTarget) {
          this.resetSolver(true);
        }
      } else {
        this.guessTargetPrev = guessTarget;
        this.playMode = false;
      }
    },

    onShowHelp() {
      this.$q.dialog({
        component: WHelp,
      });
    },

    onShareClick() {
      copyToClipboard(this.shareUrl)
        .then(() => {
          this.$q.notify({
            message: this.$t('solver.share_url_copied'),
            color: 'positive',
            textColor: 'white',
          });
        })
        .catch(() => {
          this.$q.notify({
            message: this.$t('solver.share_url_not_copied'),
            color: 'negative',
            textColor: 'white',
          });
        });
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

  mounted() {
    if (this.$route.params.gameId > 0) {
      const word = getPlayWord(this.$route.params.gameId);

      if (word !== null) {
        this.target = createTarget(word);
        this.playMode = true;
      }
    }

    window.addEventListener('keyup', this.onKeyUp);
  },

  beforeUnmount() {
    window.removeEventListener('keyup', this.onKeyUp);
  },
});
</script>
