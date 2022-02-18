// Source and credits:
// [Ruining the fun: a Wordle auto-solver](https://notfunatparties.substack.com/p/wordle-solver)
// [Mathematical optimization over Wordle decision trees](https://www.poirrier.ca/notes/wordle)

import treeEasyStd from './tree-easy-std.js';
import treeEasyFull from './tree-easy-full.js';
import treeHardStd from './tree-hard-std.js';
import treeHardFull from './tree-hard-full.js';

const WORD_SIZE = 5;

const stdWordsList = [...new Set(treeEasyStd.map((o) => o[1]))].sort();
const fullWordsList = [...new Set(treeEasyFull.map((o) => o[1]))].sort()
  .sort((a, b) => (stdWordsList.indexOf(a) === -1 ? 1 : 0) - (stdWordsList.indexOf(b) === -1 ? 1 : 0));

const guessWordRe = new RegExp(`^[a-z]{${ WORD_SIZE }}$`, 'i');
const guessResultRe = /^[gyb]$/i;
const matchTypes = ['g', 'y', 'b'];
const fallbackGuessWords = ['crane', 'tares', 'saber', 'roate', 'raile', 'lares'];

const cache = {};

function wordsInTargets(list, solverMode) {
  return list.map((word) => ([word, solverMode[1] === 's' ? true : stdWordsList.indexOf(word) > -1]));
}

function listFilter(list, filters) {
  const filtersB = [];
  const filtersR = [];

  for (let i = filters.length - 1; i >= 0; i -= 1) {
    const filter = filters[i];
    if (filter[2] === 'b') {
      filtersB.push(filter);
    } else {
      filtersR.push(filter);
    }
  }

  return list.filter((word) => {
    let wordB = word.split('');

    for (let i = filtersR.length - 1; i >= 0; i -= 1) {
      const [letter, position, matchType] = filtersR[i];

      if (
        (matchType === 'g' && word[position] !== letter)
        || (matchType === 'y' && (
          word.indexOf(letter) === -1
          || word[position] === letter
        ))
      ) {
        return false;
      }

      wordB = wordB.map((l) => (l === letter ? '-' : l));
    }

    for (let i = filtersB.length - 1; i >= 0; i -= 1) {
      const [letter, position] = filtersB[i];

      if (word[position] === letter || wordB.indexOf(letter) !== -1) {
        return false;
      }
    }

    return true;
  });
}

function listFilterHard(list, guesses) {
  const filterG = Array(WORD_SIZE).fill('.');
  const chars = {};

  guesses.forEach(({ word, result }) => {
    const localChars = {};

    for (let i = 0; i < WORD_SIZE; i += 1) {
      const match = result[i];
      const letter = word[i];

      if (match === 'g') {
        filterG[i] = letter;
      }

      if (match === 'y' || match === 'g') {
        if (localChars[letter] === undefined) {
          localChars[letter] = 0;

          if (chars[letter] === undefined) {
            chars[letter] = 0;
          }
        }

        localChars[letter] += 1;

        if (localChars[letter] > chars[letter]) {
          chars[letter] = localChars[letter];
        }
      }
    }
  });

  const reFilterG = new RegExp(`^${ filterG.join('') }$`);

  return Object.keys(chars).reduce((acc, char) => acc.filter((word) => {
    let len = chars[char];

    for (let i = 0; i < WORD_SIZE; i += 1) {
      if (word[i] === char) {
        len -= 1;
      }
    }

    return len <= 0;
  }), list.filter((word) => reFilterG.test(word)));
}

function wordScoreCalculate(word, list) {
  let sum = 0;

  if (list.length > 0) {
    const calculateSum = (subList, depth = 0, p = 1) => {
      const letter = word[depth];
      const pBase = p / subList.length;

      for (let m = 0; m < 3; m += 1) {
        const matchType = matchTypes[m];
        const matchingWords = listFilter(subList, [`${ letter }${ depth }${ matchType }`]);
        const matchingWordsLength = matchingWords.length;

        if (matchingWordsLength > 0) {
          const calcP = pBase * matchingWordsLength;

          if (depth >= WORD_SIZE - 1) {
            sum += calcP * calcP;
          } else {
            calculateSum(matchingWords, depth + 1, calcP);
          }
        }
      }
    };

    calculateSum(list);
  }

  return sum;
}

function decisionTreeGuess(filters, guesses, solverMode) {
  filters.sort();

  const cacheKey = `${ solverMode }${ filters }`;

  if (cache[cacheKey] !== undefined) {
    return cache[cacheKey];
  }

  if (filters.findIndex((f) => f[2] !== 'b') === -1) {
    const usedWords = guesses.map((guess) => guess.word);
    return fallbackGuessWords.filter((word) => usedWords.indexOf(word) === -1);
  }

  const filteredWordsList = listFilter(solverMode[1] === 's' ? stdWordsList : fullWordsList, filters);

  if (filteredWordsList.length === 0) {
    cache[cacheKey] = [];

    return cache[cacheKey];
  }

  const filteredWordsListLength = filteredWordsList.length;
  let words = filteredWordsListLength === 1 ? filteredWordsList : [];

  if (filteredWordsListLength > 1) {
    // eslint-disable-next-line no-nested-ternary
    const guessWordsList = filteredWordsListLength < 4
      ? filteredWordsList
      : (
        solverMode[0] === 'e'
          ? fullWordsList
          : listFilterHard(fullWordsList, guesses)
      );
    let minScore = Infinity;

    for (let i = filteredWordsListLength - 1; i >= 0; i -= 1) {
      const word = filteredWordsList[i];
      const score = wordScoreCalculate(word, guessWordsList);
      if (score < minScore) {
        minScore = score;
        words = [word];
      } else if (score === minScore) {
        words.push(word);
      }
    }
  }

  cache[cacheKey] = words.sort((a, b) => (stdWordsList.indexOf(a) === -1 ? 1 : 0) - (stdWordsList.indexOf(b) === -1 ? 1 : 0));

  return cache[cacheKey];
}

function guessesToFilters(guesses) {
  const filters = new Set();

  guesses.forEach(({ word, result }) => {
    for (let i = 0; i < WORD_SIZE; i += 1) {
      filters.add(`${ word[i] }${ i }${ result[i] }`);
    }
  });

  return [...filters].sort();
}

function normalizeResult(guessResult) {
  const result = [];
  for (let i = 0; i < WORD_SIZE; i += 1) {
    result[i] = guessResultRe.test(guessResult[i]) === true ? guessResult[i] : 'b';
  }

  return result.join('').toLowerCase();
}

function wordleSolver(solverMode) {
  // 0 - a, 1 - g, 2 - c, 3 - s
  // eslint-disable-next-line no-nested-ternary
  const solveTree = solverMode[0] === 'e'
    ? (solverMode[1] === 's' ? treeEasyStd : treeEasyFull)
    : (solverMode[1] === 's' ? treeHardStd : treeHardFull);
  const solverWordsList = solverMode[1] === 's' ? stdWordsList : fullWordsList;

  let guesses = [{
    node: 0,
    word: solveTree[0][1],
    words: [...new Set([solveTree[0][1]].concat(fallbackGuessWords))],
    result: Array(WORD_SIZE).fill('b').join(''),
  }];

  const solver = (guessResult, guessWord) => {
    const indGuess = guesses.length - 1;
    const curGuess = guesses[indGuess];

    const word = guessWordRe.test(guessWord) === true ? guessWord.toLowerCase() : curGuess.word;

    if (indGuess === 0 && word === solveTree[0][1]) {
      curGuess.node = 0;
      curGuess.word = word;
    } else if (word !== curGuess.word) {
      curGuess.node = -1;
      curGuess.word = word;
    }

    curGuess.result = normalizeResult(guessResult);

    if (curGuess.result === 'ggggg') {
      return Promise.resolve({
        words: [],
        list: [word],
      });
    }

    if (curGuess.node === -1) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const filters = guessesToFilters(guesses);
          const words = decisionTreeGuess(filters, guesses, solverMode);

          guesses.push({
            node: -1,
            word: '',
            words,
            result: Array(WORD_SIZE).fill('b').join(''),
          });

          resolve({
            words,
            list: listFilter(solverWordsList, filters),
          });
        }, 50);
      });
    }

    let nextNode = solveTree[curGuess.node][2];

    while (
      nextNode !== 0
      && solveTree[nextNode][0] !== '*****'
      && solveTree[nextNode][0] !== curGuess.result
    ) {
      // eslint-disable-next-line prefer-destructuring
      nextNode = solveTree[nextNode][3];
    }

    const list = listFilter(solverWordsList, guessesToFilters(guesses));

    if (nextNode === 0) {
      return Promise.resolve({
        words: [],
        list,
      });
    }

    guesses.push({
      node: nextNode,
      word: solveTree[nextNode][1],
      words: [solveTree[nextNode][1]],
      result: Array(WORD_SIZE).fill('b').join(''),
    });

    return Promise.resolve({
      words: [solveTree[nextNode][1]],
      list,
    });
  };

  solver.rewind = (depth) => {
    if (depth < 0 || depth >= guesses.length) {
      return;
    }

    guesses = guesses.slice(0, depth + 1);
  };

  solver.solve = solver;
  solver.isValidGuessWord = (word) => fullWordsList.indexOf(word) > -1;
  solver.isValidTargetWord = (word) => solverWordsList.indexOf(word) > -1;
  solver.getGuesses = () => guesses;
  solver.getCurrentSolution = () => {
    const guessIndex = guesses.length - 1;

    if (guessIndex < 0) {
      return {
        words: [],
        list: [],
      };
    }

    return {
      words: guesses[guessIndex].words,
      list: listFilter(solverWordsList, guessesToFilters(guesses.slice(0, guessIndex))),
    };
  };

  return solver;
}

function wordleChecker(target) {
  return (guess) => {
    if (target === guess) {
      return 'ggggg';
    }

    const result = Array(WORD_SIZE).fill('b');
    const used = Array(WORD_SIZE).fill(false);
    const targetLetters = target.split('');

    for (let i = 0; i < WORD_SIZE; i += 1) {
      if (target[i] === guess[i]) {
        result[i] = 'g';
        used[i] = true;
      }
    }

    for (let i = 0; i < WORD_SIZE; i += 1) {
      if (target[i] !== guess[i]) {
        const pos = targetLetters.findIndex((letter, j) => letter === guess[i] && used[j] !== true);

        if (pos > -1) {
          result[i] = 'y';
          used[pos] = true;
        }
      }
    }

    return result.join('');
  };
}

function getMatchColor(matchType, forceUnmatch) {
  if (matchTypes.indexOf(matchType) > -1) {
    return `w-match-${ matchType }`;
  }
  return forceUnmatch === true ? 'w-match-b' : undefined;
}

function getPlayWord(gameId) {
  return (gameId[1] === 's' ? stdWordsList : fullWordsList)[gameId.slice(2)] || null;
}

function getPlayWordGameId(word, solverMode) {
  const index = (solverMode[1] === 's' ? stdWordsList : fullWordsList).indexOf(word);
  return index > -1 ? `${ solverMode }${ index }` : null;
}

export {
  WORD_SIZE,

  wordsInTargets,

  getMatchColor,
  getPlayWord,
  getPlayWordGameId,
  wordleSolver,
  wordleChecker,
};
