// source and credits: https://www.poirrier.ca/notes/wordle/
import treeEasy from './tree-easy.js';
import treeHard from './tree-hard.js';

const fullWordsList = [...new Set(treeEasy.map((o) => o[1]))].sort();
const guessWordRe = /^[a-z]{5}$/i;
const guessResultRe = /^[gyb]$/i;
const colours = ['g', 'y', 'b'];

const cache = {};

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
      const [letter, position, colour] = filtersR[i];

      if (
        (colour === 'g' && word[position] !== letter)
        || (colour === 'y' && (
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

function wordScoreCalculate(item, p = 1, depth = 0) {
  return colours.reduce((acc, colour) => {
    if (item[colour] !== undefined && item[colour].list.length > 0) {
      const calcP = item[colour].p * p;

      return acc + (
        depth === 4
          ? calcP * calcP
          : wordScoreCalculate(item[colour], calcP, depth + 1)
      );
    }

    return acc;
  }, 0);
}

function decisionTreeCreate(word, list, hardMode) {
  const tree = {
    list,
    p: 1,
  };
  const duplicateDivisor = hardMode === true ? -10 : 10;
  const decisionTreeFill = (treeItem, depth = 0, filters = []) => {
    if (depth < 5 && treeItem.list.length > 0) {
      colours.forEach((colour) => {
        const letter = word[depth];
        const filter = `${ letter }${ depth }${ colour }`;
        const newFilters = filters.concat(filter);

        const matchingWords = listFilter(treeItem.list, newFilters);

        treeItem[colour] = {
          list: matchingWords,
          p: (1 + word.split('').filter((l) => l === letter).length / duplicateDivisor)
            * (matchingWords.length / treeItem.list.length),
        };

        decisionTreeFill(treeItem[colour], depth + 1, newFilters);
      });
    }
  };

  decisionTreeFill(tree);

  return tree;
}

function decisionTreeGuess(filters, hardMode) {
  filters.sort();

  const cacheKey = filters.join('|') + (hardMode === true);

  if (cache[cacheKey] !== undefined) {
    return cache[cacheKey];
  }

  const filteredWordsList = listFilter(fullWordsList, filters);

  if (filteredWordsList.length === 0) {
    cache[cacheKey] = [];

    return cache[cacheKey];
  }

  const filteredWordsListLength = filteredWordsList.length;
  const usedWordsList = hardMode === true || filteredWordsListLength < 3
    ? filteredWordsList
    : fullWordsList;
  let minScore = 999999;
  const scores = { [minScore]: filteredWordsListLength === 1 ? filteredWordsList : [] };

  if (filteredWordsListLength > 1) {
    for (let i = usedWordsList.length - 1; i >= 0; i -= 1) {
      const wordTree = decisionTreeCreate(usedWordsList[i], filteredWordsList, hardMode);
      const score = wordScoreCalculate(wordTree);
      if (score < minScore) {
        minScore = score;
        scores[score] = [usedWordsList[i]];
      } else if (score === minScore) {
        scores[score].push(usedWordsList[i]);
      }
    }
  }

  const filteredLetters = filters.map((f) => f[0]);
  scores[minScore] = scores[minScore] || [];
  scores[minScore].sort(
    (a, b) => (
      a.split('').reduce((acc, l) => acc + filteredLetters.filter((fl) => fl === l).length)
      - b.split('').reduce((acc, l) => acc + filteredLetters.filter((fl) => fl === l).length)
    ),
    0,
  );

  cache[cacheKey] = scores[minScore];

  return cache[cacheKey];
}

function guessesToFilters(guesses) {
  const filters = [];

  guesses.forEach(({ word, result }) => {
    for (let i = 0; i < 5; i += 1) {
      filters.push(`${ word[i] }${ i }${ result[i] }`);
    }
  });

  return filters;
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
          const words = decisionTreeGuess(filters, hardMode);

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
        }, 0);
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

    if (nextNode === 0) {
      return Promise.resolve({
        words: [],
        list: listFilter(fullWordsList, guessesToFilters(guesses)),
      });
    }

    const list = listFilter(fullWordsList, guessesToFilters(guesses));

    guesses.push({
      node: nextNode,
      word: solveTree[nextNode][1],
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
    const guess = guesses[guessIndex];

    if (guessIndex < 0) {
      return {
        words: [],
        list: [],
      };
    }

    return {
      words: [guess.word],
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

export {
  wordleSolver,
  wordleChecker,
};
