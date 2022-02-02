import { ref, computed } from 'vue';
import { Dark, LocalStorage } from 'quasar';

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

export {
  darkMode,
  hardMode,
};
