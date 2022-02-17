// Source and credits:
// [Ruining the fun: a Wordle auto-solver](https://notfunatparties.substack.com/p/wordle-solver)
// [Mathematical optimization over Wordle decision trees](https://www.poirrier.ca/notes/wordle)

import treeEasy from './tree-easy.js';
import treeHard from './tree-hard.js';
import targetWords from './words.js';

const fullWordsList = [...new Set(treeEasy.map((o) => o[1]))]
  .sort()
  .sort((a, b) => (targetWords.indexOf(a) === -1 ? 1 : 0) - (targetWords.indexOf(b) === -1 ? 1 : 0));
const guessWordRe = /^[a-z]{5}$/i;
const guessResultRe = /^[gyb]$/i;
const matchTypes = ['g', 'y', 'b'];
const fallbackGuessWords = ['crane', 'tares', 'spaer', 'lares'];

const cache = {};
const cacheList = {};

function listFilter(list, filters) {
  const cacheKey = String(list) + String(filters);

  if (cacheList[cacheKey] === undefined) {
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

    cacheList[cacheKey] = list.filter((word) => {
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

  return cacheList[cacheKey];
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

          if (depth >= 4) {
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

function decisionTreeGuess(filters) {
  filters.sort();

  const cacheKey = String(filters);

  if (cache[cacheKey] !== undefined) {
    return cache[cacheKey];
  }

  if (filters.findIndex((f) => f[2] !== 'b') === -1) {
    const filteredWordsList = listFilter(fallbackGuessWords, filters);

    return filteredWordsList.length > 0 ? filteredWordsList : fallbackGuessWords;
  }

  const filteredWordsList = listFilter(fullWordsList, filters);

  if (filteredWordsList.length === 0) {
    cache[cacheKey] = [];

    return cache[cacheKey];
  }

  const filteredWordsListLength = filteredWordsList.length;
  let words = filteredWordsListLength === 1 ? filteredWordsList : [];

  if (filteredWordsListLength > 1) {
    let minScore = Infinity;

    for (let i = filteredWordsListLength - 1; i >= 0; i -= 1) {
      const word = filteredWordsList[i];
      const score = wordScoreCalculate(word, filteredWordsList);
      if (score < minScore) {
        minScore = score;
        words = [word];
      } else if (score === minScore) {
        words.push(word);
      }
    }
  }

  cache[cacheKey] = words.sort((a, b) => (targetWords.indexOf(a) === -1 ? 1 : 0) - (targetWords.indexOf(b) === -1 ? 1 : 0));

  return cache[cacheKey];
}

function guessesToFilters(guesses) {
  const filters = new Set();

  guesses.forEach(({ word, result }) => {
    for (let i = 0; i < 5; i += 1) {
      filters.add(`${ word[i] }${ i }${ result[i] }`);
    }
  });

  return [...filters].sort();
}

function normalizeResult(guessResult) {
  const result = [];
  for (let i = 0; i < 5; i += 1) {
    result[i] = guessResultRe.test(guessResult[i]) === true ? guessResult[i] : 'b';
  }

  return result.join('').toLowerCase();
}

function wordleSolver(hardMode) {
  // 0 - a, 1 - g, 2 - c, 3 - s
  const solveTree = hardMode === true ? treeHard : treeEasy;

  let guesses = [{
    node: 0,
    word: solveTree[0][1],
    words: [...new Set([solveTree[0][1]].concat(fallbackGuessWords))],
    result: Array(5).fill('b').join(''),
  }];

  const solver = (guessResult, guessWord) => {
    const indGuess = guesses.length - 1;
    const curGuess = guesses[indGuess];

    const word = guessWordRe.test(guessWord) === true ? guessWord.toLowerCase() : curGuess.word;
    if (word !== curGuess.word) {
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
          const words = decisionTreeGuess(filters);

          guesses.push({
            node: -1,
            word: '',
            words,
            result: Array(5).fill('b').join(''),
          });

          resolve({
            words,
            list: listFilter(fullWordsList, filters),
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

    const list = listFilter(fullWordsList, guessesToFilters(guesses));

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
      result: Array(5).fill('b').join(''),
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
  solver.isValidWord = (word) => fullWordsList.indexOf(word) > -1;
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
      list: listFilter(fullWordsList, guessesToFilters(guesses.slice(0, guessIndex))),
    };
  };

  return solver;
}

function wordleChecker(target) {
  return (guess) => {
    if (target === guess) {
      return 'ggggg';
    }

    const result = Array(5).fill('b');
    const used = Array(5).fill(false);
    const targetLetters = target.split('');

    for (let i = 0; i < 5; i += 1) {
      if (target[i] === guess[i]) {
        result[i] = 'g';
        used[i] = true;
      }
    }

    for (let i = 0; i < 5; i += 1) {
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

function getPlayWord(index) {
  return fullWordsList[index] || null;
}

function getPlayWordIndex(word) {
  const index = fullWordsList.indexOf(word);
  return index > -1 ? index : null;
}

export {
  getMatchColor,
  getPlayWord,
  getPlayWordIndex,
  wordleSolver,
  wordleChecker,
};
