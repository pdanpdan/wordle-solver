# Wordle Solver (wordle-solver)

Wordle Solver Helper

- can provide optimal solve for unknown words
- can auto check guesses against a known word
- by default uses the precompiled decision tree
- if one guess does not use the precompiled decision tree then it switches to dynamic decission tree

Source and credits:
- [Ruining the fun: a Wordle auto-solver](https://notfunatparties.substack.com/p/wordle-solver)
- [Mathematical optimization over Wordle decision trees](https://www.poirrier.ca/notes/wordle)

## How to run

### Install the dependencies
```bash
yarn
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
quasar dev
```

### Lint the files
```bash
yarn run lint
```

### Build the app for production
```bash
quasar build -m pwa
```
