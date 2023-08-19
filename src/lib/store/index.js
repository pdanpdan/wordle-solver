import { ref, computed } from 'vue';
import { Dark, LocalStorage } from 'quasar';

import { WORD_SIZE } from 'lib/solver/wordle-solver.js';

const letterRe = /^[a-z]$/i;
const allLetters = 'abcdefghijklmnopqrstuvwxyz'.split('');

function createGuess() {
  return {
    letters: Array(WORD_SIZE).fill(''),
    matchTypes: Array(WORD_SIZE).fill('x'),
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
  const target = Array(WORD_SIZE).fill('');

  if (typeof word === 'string') {
    for (let i = 0; i < WORD_SIZE; i += 1) {
      target[i] = letterRe.test(word[i]) === true ? word[i].toLowerCase() : '';
    }
  }

  return target;
}

function createCharsMatch() {
  return allLetters.reduce((acc, letter) => {
    acc[letter] = {
      match: 'x',
      count: 0,
    };

    return acc;
  }, {});
}

// dark mode
Dark.set(LocalStorage.getItem('darkMode') === true);
const darkMode = computed({
  get() {
    return Dark.isActive;
  },

  set(value) {
    Dark.set(value === true);
    LocalStorage.set('darkMode', Dark.isActive);
  },
});

// solver mode
const storedSolverMode = LocalStorage.getItem('solverMode');
const solverModeValue = ref(['es', 'ef', 'hs', 'hf'].indexOf(storedSolverMode) > -1 ? storedSolverMode : 'es');
const solverMode = computed({
  get() {
    return solverModeValue.value;
  },

  set(value) {
    solverModeValue.value = ['es', 'ef', 'hs', 'hf'].indexOf(value) > -1 ? value : 'es';
    LocalStorage.set('solverMode', solverModeValue.value);
  },
});

// default colors for dark / light mode
const defaultColors = computed(() => (
  Dark.isActive === true
    ? {
      color: 'w-mode-dark',
      textColor: 'w-mode-dark',
    }
    : {
      color: 'w-mode-light',
      textColor: 'w-mode-light',
    }
));

// target edit mode
const targetMode = ref(false);

// play mode
const playMode = ref(false);

// list of tried guesses
const guesses = ref([]);

// mapping of the guesses result for each char
const charsMatchType = computed(() => {
  const chars = createCharsMatch();

  if (targetMode.value !== true) {
    guesses.value.forEach(({ letters, matchTypes }) => {
      const localChars = createCharsMatch();

      for (let i = 0; i < WORD_SIZE; i += 1) {
        const letter = letters[i];
        const matchType = matchTypes[i];

        if (matchType === 'b' && localChars[letter].match === 'x') {
          localChars[letter] = { match: 'b', count: 0 };

          if (chars[letter].match === 'x') {
            chars[letter].match = 'b';
          }
        } else if (matchType === 'g' || matchType === 'y') {
          localChars[letter].count += 1;

          if (chars[letter].count < localChars[letter].count) {
            chars[letter].count = localChars[letter].count;
          }

          if (matchType === 'g' || (matchType === 'y' && localChars[letter].match !== 'g')) {
            localChars[letter].match = matchType;

            if (matchType === 'g' || (matchType === 'y' && chars[letter].match !== 'g')) {
              chars[letter].match = matchType;
            }
          }
        }
      }

      for (let i = 0; i < WORD_SIZE; i += 1) {
        const letter = letters[i];
        const matchType = matchTypes[i];

        if (matchType === 'x' && localChars[letter].match === 'x' && chars[letter].match === 'x') {
          chars[letter].match = 'b';
        }
      }
    });
  }

  return chars;
});

export {
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
};
