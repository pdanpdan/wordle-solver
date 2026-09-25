// Source and credits:
// [Ruining the fun: a Wordle auto-solver](https://notfunatparties.substack.com/p/wordle-solver)
// [Mathematical optimization over Wordle decision trees](https://www.poirrier.ca/notes/wordle)

import treeEasyStd from './tree-easy-std.js';
import treeEasyFull from './tree-easy-full.js';
import treeHardStd from './tree-hard-std.js';
import treeHardFull from './tree-hard-full.js';
import stdWordsList from './std-words-list.json';
import fullWordsList from './full-words-list.json';

const WORD_SIZE = 5;
const MAX_GUESSES = 6;

const guessWordRe = new RegExp(`^[a-z]{${ WORD_SIZE }}$`, 'i');
const guessResultRe = /^[gyb]$/i;
const matchTypes = ['g', 'y', 'b'];
// a match is encoded as a base 3 number using these digits: 0 - black, 1 - yellow, 2 - green
const matchTypesByCode = ['b', 'y', 'g'];
const matchCodesByType = { b: 0, y: 1, g: 2 };
const matchPatterns = 3 ** WORD_SIZE;
const matchPatternSolved = matchPatterns - 1;

const cache = {};

// reusable buffers: matching a guess against a word is the hot path of the solver
const matchCounts = new Int8Array(128);
const matchDigits = new Int8Array(WORD_SIZE);
const matchBuckets = new Int32Array(matchPatterns);
const matchBucketDigits = new Int32Array(matchPatterns);

// the official Wordle match between `guess` and `target`, as a base 3 number
function patternIndex(guess, target) {
  let i;

  for (i = 0; i < WORD_SIZE; i += 1) {
    matchCounts[target.charCodeAt(i)] += 1;
  }

  for (i = 0; i < WORD_SIZE; i += 1) {
    const letter = guess.charCodeAt(i);

    if (letter === target.charCodeAt(i)) {
      matchDigits[i] = 2;
      matchCounts[letter] -= 1;
    } else {
      matchDigits[i] = 0;
    }
  }

  for (i = 0; i < WORD_SIZE; i += 1) {
    if (matchDigits[i] === 0) {
      const letter = guess.charCodeAt(i);

      if (matchCounts[letter] > 0) {
        matchDigits[i] = 1;
        matchCounts[letter] -= 1;
      }
    }
  }

  for (i = 0; i < WORD_SIZE; i += 1) {
    matchCounts[target.charCodeAt(i)] = 0;
  }

  return ((((matchDigits[0] * 3) + matchDigits[1]) * 3 + matchDigits[2]) * 3 + matchDigits[3]) * 3 + matchDigits[4];
}

function resultFromPattern(pattern) {
  let result = '';
  let rest = pattern;

  for (let i = 0; i < WORD_SIZE; i += 1) {
    result = matchTypesByCode[rest % 3] + result;
    rest = Math.floor(rest / 3);
  }

  return result;
}

function patternFromResult(result) {
  let pattern = 0;

  for (let i = 0; i < WORD_SIZE; i += 1) {
    pattern = (pattern * 3) + matchCodesByType[result[i]];
  }

  return pattern;
}

function wordsInTargets(list, solverMode) {
  return list.map((word) => ([word, solverMode[1] === 's' ? true : stdWordsList.indexOf(word) > -1]));
}

// the words that are still possible answers, given everything that was tried so far
function listFilter(list, guesses) {
  const guessesLength = guesses.length;

  if (guessesLength === 0) {
    return list.slice();
  }

  const patterns = guesses.map(({ word, result }) => ([word, patternFromResult(result)]));

  return list.filter((word) => {
    for (let i = guessesLength - 1; i >= 0; i -= 1) {
      const [guess, pattern] = patterns[i];

      if (patternIndex(guess, word) !== pattern) {
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

// how good a guess is for the given candidates, both values are minimized:
// - score: the sum of the squared sizes of the groups the guess splits the candidates into, which is
//   the exact counterpart of the probability of two candidates colliding. The group where the guess
//   is itself the answer is skipped, because that outcome ends the game instead of leaving
//   candidates to narrow down.
// - worst: the size of the largest group, used to break ties towards the safest guess.
// Entropy was measured here as well and is worse in this in-the-moment setting (3.54 against 3.52 on
// the easy standard list, 4.00 against 3.85 on the easy full list), even though it is the better
// criterion when building a whole tree offline - see scripts/generate-trees.mjs.
function wordScoreCalculate(word, list) {
  const total = list.length;

  if (total === 0) {
    return { score: Infinity, worst: 0 };
  }

  let bucketsLength = 0;
  let score = 0;
  let worst = 0;

  for (let i = 0; i < total; i += 1) {
    const bucket = patternIndex(word, list[i]);

    // an all green match means this guess is the answer, so the game is over and nothing is left to narrow down
    if (bucket !== matchPatternSolved) {
      if (matchBuckets[bucket] === 0) {
        matchBucketDigits[bucketsLength] = bucket;
        bucketsLength += 1;
      }

      matchBuckets[bucket] += 1;
    }
  }

  for (let i = 0; i < bucketsLength; i += 1) {
    const bucket = matchBucketDigits[i];
    const count = matchBuckets[bucket];

    matchBuckets[bucket] = 0;

    score += count * count;

    if (count > worst) {
      worst = count;
    }
  }

  return { score, worst };
}

function wordScoreCompare(a, b) {
  return (a.score - b.score) || (a.worst - b.worst);
}

function decisionTreeGuess(guesses, solverMode) {
  const cacheKey = `${ solverMode }${ guesses.map(({ word, result }) => `${ word }${ result }`).join('') }`;

  if (cache[cacheKey] !== undefined) {
    return cache[cacheKey];
  }

  const guessesLength = guesses.length;

  const filteredWordsList = listFilter(solverMode[1] === 's' ? stdWordsList : fullWordsList, guesses);
  const filteredWordsListLength = filteredWordsList.length;

  if (filteredWordsListLength === 0) {
    cache[cacheKey] = [];

    return cache[cacheKey];
  }

  let words = filteredWordsListLength === 1 ? filteredWordsList : [];

  if (filteredWordsListLength > 1) {
    // eslint-disable-next-line no-nested-ternary
    const guessWordsList = filteredWordsListLength < MAX_GUESSES - guessesLength
      ? filteredWordsList
      : (
        solverMode[0] === 'e'
          ? fullWordsList
          : listFilterHard(fullWordsList, guesses)
      );
    // a word that was already tried cannot narrow the candidates down
    const triedWords = new Set(guesses.map(({ word }) => word));
    const untriedWordsList = guessWordsList.filter((word) => triedWords.has(word) !== true);
    const candidatesList = untriedWordsList.length > 0 ? untriedWordsList : guessWordsList;
    const candidatesListLength = candidatesList.length;
    let minScore = { score: Infinity, worst: Infinity };

    for (let i = candidatesListLength - 1; i >= 0; i -= 1) {
      const word = candidatesList[i];
      const score = wordScoreCalculate(word, filteredWordsList);
      const compare = wordScoreCompare(score, minScore);

      if (compare < 0) {
        minScore = score;
        words = [word];
      } else if (compare === 0) {
        words.push(word);
      }
    }
  }

  cache[cacheKey] = words.sort((a, b) => (stdWordsList.indexOf(a) === -1 ? 1 : 0) - (stdWordsList.indexOf(b) === -1 ? 1 : 0));

  return cache[cacheKey];
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

  // the tree root is the opening guess the trees were built around, so it is the only one worth suggesting
  let guesses = [{
    node: 0,
    word: solveTree[0][1],
    words: [solveTree[0][1]],
    result: Array(WORD_SIZE).fill('b').join(''),
  }];

  const solveDynamic = (resolve) => {
    setTimeout(() => {
      const words = decisionTreeGuess(guesses, solverMode);
      const list = listFilter(solverWordsList, guesses);

      guesses.push({
        node: -1,
        word: '',
        words,
        result: Array(WORD_SIZE).fill('b').join(''),
      });

      resolve({ words, list });
    }, 50);
  };

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

    // walk the precompiled tree, where children are linked as first child and next sibling
    let nextNode = curGuess.node === -1 ? 0 : solveTree[curGuess.node][2];

    while (
      nextNode !== 0
      && solveTree[nextNode][0] !== '*****'
      && solveTree[nextNode][0] !== curGuess.result
    ) {
      // eslint-disable-next-line prefer-destructuring
      nextNode = solveTree[nextNode][3];
    }

    // the precompiled tree has no branch for this result: solve it dynamically instead of giving up
    if (nextNode === 0) {
      return new Promise(solveDynamic);
    }

    const list = listFilter(solverWordsList, guesses);

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
      list: listFilter(solverWordsList, guesses.slice(0, guessIndex)),
    };
  };

  return solver;
}

function wordleChecker(target) {
  return (guess) => resultFromPattern(patternIndex(guess, target));
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

function getTargetWords(partialWord, solverMode) {
  const letters = partialWord.split('').reduce((acc, letter) => {
    if (acc[letter] === undefined) {
      acc[letter] = 1;
    } else {
      acc[letter] += 1;
    }

    return acc;
  }, {});
  const filters = Object.keys(letters).map((letter) => ([letter, letters[letter]]));

  return (solverMode[1] === 's' ? stdWordsList : fullWordsList)
    .filter((w) => filters.every(([letter, count]) => w.split('').filter((l) => l === letter).length >= count) === true);
}

export {
  WORD_SIZE,

  wordsInTargets,
  getTargetWords,

  getMatchColor,
  getPlayWord,
  getPlayWordGameId,
  wordleSolver,
  wordleChecker,
};
