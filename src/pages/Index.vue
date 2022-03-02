<template>
  <div class="fixed-full q-pb-sm column no-wrap items-center">
    <div class="full-width col column no-wrap items-center" style="max-width: 1024px; background-color: rgba(90, 90, 90, .01)">
      <div class="q-py-xs row no-wrap items-center q-gutter-x-md">
        <q-btn
          v-bind="defaultColors"
          round
          unelevated
          size="md"
          padding="sm"
          icon="description"
          :aria-label="$t('solver.btn_help')"
          @click="onShowHelp"
        />

        <q-btn
          v-bind="defaultColors"
          unelevated
          size="md"
          padding="sm md"
          :aria-label="$t('solver.btn_reset_solver')"
          @click="resetSolver()"
        >
          <div>{{ $t('solver.reset') }}</div>
        </q-btn>

        <q-btn
          v-bind="defaultColors"
          unelevated
          size="md"
          padding="sm md"
          :aria-label="solverModeTooltip"
          @click="onChangeSolverMode"
        >
          <div style="min-width: 6em">{{ solverModeLabel }}</div>
          <q-tooltip class="q-py-sm q-px-md bg-grey-4 text-dark text-subtitle2">{{ solverModeTooltip }}</q-tooltip>
        </q-btn>

        <q-btn
          v-bind="defaultColors"
          round
          unelevated
          size="md"
          padding="sm"
          :icon="darkMode === true ? 'dark_mode' : 'light_mode'"
          :aria-label="darkMode === true ? $t('solver.btn_to_light_mode') : $t('solver.btn_to_dark_mode')"
          @click="darkMode = darkMode !== true"
        />
      </div>

      <q-separator class="full-width"/>

      <div class="q-my-sm row no-wrap items-center q-gutter-x-sm">
        <q-btn
          v-for="i in WORD_SIZE"
          :key="i"
          :class="{ 'w-letter--active': targetMode === true && guessTargetLength === i - 1 }"
          outline
          size="28px"
          padding="2px"
          :color="defaultColors.color"
          :text-color="guessTargetColor"
          disable
        >
          <div style="min-width: 1.715em">
            <template v-if="targetMode === true">{{ target[i - 1] || '&nbsp;' }}</template>
            <template v-else>{{ guessTargetOptions[i - 1].target || '?' }}</template>
          </div>

          <template v-if="targetMode !== true">
            <div v-for="(letter, j) in guessTargetOptions[i - 1].opts" :key="j" class="w-target__suggestion">{{ letter }}</div>
          </template>
        </q-btn>

        <q-btn
          class="q-ml-md"
          v-bind="targetBtnProps"
          round
          unelevated
          size="md"
          padding="sm"
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

      <q-separator v-show="targetMode !== true" class="full-width"/>

      <q-scroll-area v-show="targetMode !== true" class="col full-width">
        <div class="column no-wrap items-center">
          <w-guess-history-item
            v-for="(guess, j) in guessesVisible"
            :key="j"
            :guess="guess"
            @undo="undoSolver(j)"
          />

          <div v-if="guessSolved !== true && solutionListLength > 0" class="q-mt-sm row no-wrap items-center q-gutter-x-sm">
            <q-btn
              v-for="i in WORD_SIZE"
              :key="i"
              ref="btnGuessLetter"
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
              round
              unelevated
              size="md"
              padding="sm"
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
                  :disable="guessSolved === true || props.disable === true"
                  @click="onSelectNextGuess"
                />
              </div>
            </div>
          </template>
        </div>
      </q-scroll-area>

      <q-space v-if="targetMode === true"/>

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
  WORD_SIZE,

  wordsInTargets,

  getMatchColor,
  getPlayWord,
  getPlayWordGameId,

  wordleChecker,
  wordleSolver,
} from 'lib/solver/wordle-solver.js';

import {
  darkMode,
  solverMode,
  targetMode,
  playMode,

  defaultColors,

  createGuess,
  createSolution,
  createTarget,

  guesses,
  charsMatchType,
} from 'lib/store';

export default defineComponent({
  name: 'PageIndex',

  components: {
    WGuessHistoryItem,
    WKeyboard,
    WSolutionWord,
  },

  data() {
    return {
      WORD_SIZE,

      darkMode,
      solverMode,

      targetMode,
      target: createTarget(),

      playMode,

      guess: createGuess(),
      solution: createSolution(),

      defaultColors,

      guessesVisible: [],

      solver: null,
      checker: null,
    };
  },

  computed: {
    solverModeLabel() {
      if (this.solverMode[0] === 'h') {
        return this.solverMode[1] === 'f'
          ? this.$t('solver.btn_hard_full_mode')
          : this.$t('solver.btn_hard_std_mode');
      }

      return this.solverMode[1] === 'f'
        ? this.$t('solver.btn_easy_full_mode')
        : this.$t('solver.btn_easy_std_mode');
    },

    solverModeTooltip() {
      // hf -> es -> ef -> hs
      if (this.solverMode[0] === 'h') {
        return this.solverMode[1] === 'f'
          ? this.$t('solver.btn_to_easy_std_mode_tooltip')
          : this.$t('solver.btn_to_hard_full_mode_tooltip');
      }

      return this.solverMode[1] === 'f'
        ? this.$t('solver.btn_to_hard_std_mode_tooltip')
        : this.$t('solver.btn_to_easy_full_mode_tooltip');
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

    guessLettersFilled() {
      return this.guessLettersLength === WORD_SIZE
        ? this.guessLetters
        : '';
    },

    guessLettersValid() {
      return this.guessLettersFilled !== ''
        && this.solver !== null
        && this.solver.isValidGuessWord(this.guessLettersFilled);
    },

    guessColorsConflicts() {
      const conflicts = Array(WORD_SIZE).fill(false);
      const { letters, matchTypes } = this.guess;
      const iMax = this.guessLettersLength;

      for (let i = 0; i < iMax; i += 1) {
        const letter = letters[i];
        const letterMatchType = matchTypes[i];
        const charMatchType = charsMatchType.value[letter].match;

        if (this.solverMode[0] === 'h') {
          guesses.value.forEach((guess) => {
            if (conflicts[i] !== true && guess.letters[i] !== letter && guess.matchTypes[i] === 'g') {
              conflicts[i] = true;
            }
          });
        }

        if (conflicts[i] !== true) {
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
                guess.letters[i] === letter && (
                  guess.matchTypes[i] === 'g'
                  || (
                    guess.matchTypes[i] !== 'y'
                    && guess.letters.findIndex((l, j) => l === letter && (matchTypes[j] === 'g' || matchTypes[j] === 'y')) > -1
                  )
                )
              )) > -1
            ) {
              conflicts[i] = true;
            }
          } else if (guesses.value.findIndex((guess) => (
            guess.letters[i] === letter && (
              guess.matchTypes[i] === 'g'
              || (
                guess.matchTypes[i] === 'y'
                && letters.findIndex((l, j) => j < i && l === letter && (matchTypes[j] === 'g' || matchTypes[j] === 'y')) === -1
              )
            )
          )) > -1) {
            conflicts[i] = true;
          }
        }
      }

      const countY = matchTypes.filter((matchType) => matchType === 'y').length;
      const countG = matchTypes.filter((matchType) => matchType === 'g').length;

      if (countY === 1 && countG === WORD_SIZE - 1) {
        conflicts[matchTypes.indexOf('y')] = true;
      }

      return conflicts;
    },

    guessColorsValid() {
      if (this.guessLettersValid !== true) {
        return false;
      }

      const valid = this.guessColorsConflicts.indexOf(true) === -1;

      if (this.solverMode[0] === 'e' || valid !== true) {
        return valid;
      }

      const usedLetters = JSON.parse(JSON.stringify(charsMatchType.value));
      const { letters } = this.guess;

      for (let i = 0; i < WORD_SIZE; i += 1) {
        const { guess } = this.guessTargetOptions[i];
        const letter = letters[i];

        if (guess !== '' && guess !== letter) {
          return false;
        }

        usedLetters[letter].count -= 1;
      }

      return Object.keys(usedLetters).findIndex((letter) => usedLetters[letter].count > 0) === -1;
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
      return this.targetMode === true || this.playMode === true
        ? this.target.join('')
        : this.guessTargetOptions.map((obj) => obj.target).join('');
    },

    guessTargetLength() {
      return this.guessTarget.length;
    },

    guessTargetFilled() {
      return this.guessTargetLength === WORD_SIZE
        ? this.guessTarget
        : '';
    },

    guessTargetValid() {
      return this.guessTargetLength === WORD_SIZE
        && this.solver !== null
        && this.solver.isValidTargetWord(this.guessTargetFilled);
    },

    guessTargetOptions() {
      const arrBase = Array(WORD_SIZE).fill(null);
      const usedLetters = JSON.parse(JSON.stringify(charsMatchType.value));
      const options = arrBase.map(() => ({ opts: [], target: '', guess: '' }));
      let free = arrBase.map((_, i) => i);

      if (this.playMode !== true) {
        this.target.forEach((letter, i) => {
          if (letter !== '') {
            options[i].target = letter;
            usedLetters[letter].count -= 1;
          }
        });
      }

      guesses.value.forEach(({ letters, matchTypes }) => {
        free.forEach((i) => {
          if (options[i].guess === '' && matchTypes[i] === 'g') {
            options[i].target = letters[i];
            options[i].guess = letters[i];
            usedLetters[letters[i]].count -= 1;
          }
        });
      });

      free = free.filter((i) => options[i].target === '');

      if (free.length === 0) {
        return options;
      }

      const opts = Object.keys(usedLetters).filter((letter) => usedLetters[letter].count > 0);
      free.forEach((i) => {
        options[i].opts = opts.slice();
      });

      free.forEach((i) => {
        guesses.value.forEach(({ letters, matchTypes }) => {
          if (matchTypes[i] !== 'g') {
            options[i].opts = options[i].opts.filter((letter) => letter !== letters[i]);
          }
        });
      });

      opts.forEach((letter) => {
        let count = 0;
        let pos = -1;

        free.forEach((i) => {
          if (options[i].opts.indexOf(letter) > -1) {
            count += 1;
            pos = i;
          }
        });

        if (count === 1) {
          options[pos].target = letter;
          options[pos].guess = letter;
          options[pos].opts = [];
        }
      });

      return options;
    },

    guessTargetColor() {
      if (this.guessTargetValid === true) {
        return 'positive';
      }

      if (this.guessTargetLength > 0 && (this.targetMode !== true || this.guessTargetLength === WORD_SIZE)) {
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

      const { letters, matchTypes } = this.guessesVisible[guessesLength - 1];

      return this.guessTargetFilled === letters.join('') || matchTypes.join('') === 'ggggg';
    },

    canSubmit() {
      return (this.targetMode === true && (this.guessTargetValid === true || this.guessTargetLength < WORD_SIZE))
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
      const { guessLettersFilled } = this;

      return wordsInTargets(this.solution.words, this.solverMode).map(([word, inTargetWords]) => ({
        word,
        mark: inTargetWords,
        disable: disable === true || word === guessLettersFilled,
      }));
    },

    solutionListProps() {
      const { guessLettersFilled } = this;

      let list;

      if (this.solutionListLength <= 30) {
        list = this.solution.list;
      } else {
        list = this.solution.list.slice(0, 29).concat(`... ${ this.solutionListLength - 29 }`);
      }

      list = wordsInTargets(list, this.solverMode);

      return list.map(([word, inTargetWords]) => ({
        word,
        mark: inTargetWords,
        disable: word[0] === '.' || word === guessLettersFilled,
      }));
    },

    shareUrl() {
      if (this.guessTargetValid === true) {
        const gameId = getPlayWordGameId(this.guessTargetFilled, this.solverMode);

        if (gameId !== null) {
          const { href } = this.$router.resolve({
            name: 'solver',
            params: { gameId },
          });

          return `${ window.location.origin }${ href }`;
        }
      }

      return null;
    },

    targetBtnProps() {
      return this.targetMode === true
        ? {
          icon: 'send',
          color: this.canSubmit === true ? 'primary' : this.defaultColors.color,
          textColor: this.canSubmit === true ? undefined : this.defaultColors.textColor,
          ariaLabel: this.$t('solver.btn_save_target'),
          disable: this.canSubmit !== true,
        }
        : {
          icon: this.playMode === true ? 'visibility' : 'edit',
          ...this.defaultColors,
          ariaLabel: this.$t('solver.btn_edit_target'),
        };
    },
  },

  watch: {
    solverMode() {
      this.$nextTick(() => {
        this.resetSolver(true);
      });
    },

    guessLetters() {
      this.fillGuessMatches();
    },

    guessTargetFilled() {
      this.checker = this.guessTargetValid === true
        ? wordleChecker(this.guessTargetFilled)
        : null;
    },
  },

  methods: {
    resetSolver(keepTarget) {
      guesses.value = [];
      this.guess = createGuess();

      if (keepTarget !== true) {
        this.target = createTarget();
        this.playMode = false;
      }

      this.checker = this.guessTargetValid === true
        ? wordleChecker(this.guessTargetFilled)
        : null;

      this.solver = wordleSolver(this.solverMode);

      this.guessesVisible = guesses.value.slice();
      this.solution = createSolution(this.solver.getCurrentSolution());
    },

    undoSolver(index) {
      if (index < 0 || index >= this.guessesLength) {
        return;
      }

      this.guess = guesses.value[index];
      guesses.value = guesses.value.slice(0, index);
      this.solver.rewind(index);

      this.guessesVisible = guesses.value.slice();
      this.solution = createSolution(this.solver.getCurrentSolution());
    },

    addGuess() {
      if (this.guessLettersValid !== true || this.guessColorsValid !== true) {
        return;
      }

      const { letters, matchTypes } = this.guess;

      if (this.checker !== null) {
        const result = this.checker(this.guessLettersFilled);

        for (let i = 0; i < WORD_SIZE; i += 1) {
          matchTypes[i] = result[i];
        }
      }

      if (this.playMode === true) {
        guesses.value.push({
          letters,
          matchTypes,
        });

        this.guessesVisible = guesses.value.slice();
        this.guess = createGuess();

        return;
      }

      this.guess.processing = true;

      this.solver
        .solve(matchTypes.join(''), this.guessLettersFilled)
        .then((solution) => {
          this.solution = createSolution(solution);

          guesses.value.push({
            letters,
            matchTypes,
          });

          this.guessesVisible = guesses.value.slice();
          this.guess = createGuess();
        });
    },

    fillGuessMatches() {
      const { guessLetters } = this;

      if (this.checker !== null && guessLetters.length === WORD_SIZE) {
        const result = this.checker(guessLetters);

        for (let i = 0; i < WORD_SIZE; i += 1) {
          this.guess.matchTypes[i] = result[i];
        }

        return;
      }

      if (this.solutionListLength === 1 && this.solution.list[0][0] === guessLetters) {
        for (let i = 0; i < WORD_SIZE; i += 1) {
          this.guess.matchTypes[i] = 'g';
        }

        return;
      }

      const usedLetters = JSON.parse(JSON.stringify(charsMatchType.value));
      const iMax = this.guessLettersLength;

      for (let i = 0; i < iMax; i += 1) {
        const letter = this.guess.letters[i];
        this.guess.matchTypes[i] = 'x';

        if (usedLetters[letter].match !== 'x') {
          if (usedLetters[letter].count <= 0) {
            this.guess.matchTypes[i] = 'b';
          } else if (guesses.value.findIndex(({ letters, matchTypes }) => letters[i] === letter && matchTypes[i] === 'g') > -1) {
            this.guess.matchTypes[i] = 'g';
            usedLetters[letter].count -= 1;
          }
        }
      }

      for (let i = 0; i < iMax; i += 1) {
        const letter = this.guess.letters[i];

        if (usedLetters[letter].match !== 'x' && this.guess.matchTypes[i] === 'x') {
          if (usedLetters[letter].count <= 0) {
            this.guess.matchTypes[i] = 'b';
          } else {
            this.guess.matchTypes[i] = 'y';
            usedLetters[letter].count -= 1;
          }
        }
      }
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
      const { guessLettersLength, guessTargetLength } = this;

      if (key === 'BS') {
        if (this.targetMode === true) {
          if (guessTargetLength > 0) {
            this.target[guessTargetLength - 1] = '';
          }
        } else if (guessLettersLength > 0) {
          this.guess.matchTypes[guessLettersLength - 1] = 'x';
          this.guess.letters[guessLettersLength - 1] = '';

          const ref = (this.$refs.btnGuessLetter || [])[guessLettersLength - 2];
          this.$nextTick(() => {
            if (ref) {
              ref.$el.focus();
            }
          });
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
        if (guessTargetLength < WORD_SIZE) {
          this.target[guessTargetLength] = key;
        }
      } else if (guessLettersLength < WORD_SIZE) {
        this.guess.letters[guessLettersLength] = key;
        this.guess.matchTypes[guessLettersLength] = 'x';

        const ref = (this.$refs.btnGuessLetter || [])[guessLettersLength];
        this.$nextTick(() => {
          if (ref) {
            ref.$el.focus();
          }
        });
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
      this.guess.letters = word.slice(0, WORD_SIZE).split('');
      this.guess.matchTypes = Array(WORD_SIZE).fill('x');

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

    onChangeSolverMode() {
      // hf -> es -> ef -> hs
      if (this.solverMode === 'es') {
        this.solverMode = 'ef';
      } else if (this.solverMode === 'ef') {
        this.solverMode = 'hs';
      } else if (this.solverMode === 'hs') {
        this.solverMode = 'hf';
      } else {
        this.solverMode = 'es';
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
    const { gameId } = this.$route.params;

    if (typeof gameId === 'string' && gameId.length > 2) {
      const word = getPlayWord(gameId);

      if (word !== null) {
        this.solverMode = gameId.slice(0, 2);
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
