import { ref, computed } from 'vue';
import { Dark, LocalStorage } from 'quasar';

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

// hard mode
const hardModeValue = ref(LocalStorage.getItem('hardMode') === true);
const hardMode = computed({
  get() {
    return hardModeValue.value;
  },

  set(value) {
    hardModeValue.value = value === true;
    LocalStorage.set('hardMode', hardModeValue.value);
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
  const chars = {};

  if (targetMode.value !== true) {
    guesses.value.forEach(({ letters, matchTypes }) => {
      for (let i = 0; i < 5; i += 1) {
        const letter = letters[i];
        const matchType = matchTypes[i];

        if (chars[letter] === undefined || matchType === 'g') {
          chars[letter] = matchType === 'x' ? 'b' : matchType;
        }
      }
    });
  }

  return chars;
});

export {
  darkMode,
  hardMode,
  targetMode,
  playMode,

  defaultColors,

  guesses,
  charsMatchType,
};