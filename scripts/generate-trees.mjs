// Regenerates the precompiled decision trees in src/lib/solver/tree-*.js.
//
// A tree is a flat array of rows [matchPattern, guessWord, firstChildIndex, nextSiblingIndex] that
// wordleSolver() walks: a node's children are linked through firstChild/nextSibling, and the child
// whose matchPattern equals the reported result is the next node to visit. An all green result
// never reaches a row because that outcome ends the game.
//
// The trees cache what the runtime solver would decide on its own, but without the search cost, so
// the build mirrors decisionTreeGuess() exactly:
//   - the guess pool is the remaining candidates once the candidate set is smaller than the number
//     of guesses left, otherwise every word (easy mode) or every word still legal in hard mode;
//   - a word that was already tried is never picked again, since it cannot narrow anything down;
//   - ties go to the word of the standard list.
// The ranking criterion is the entropy of the candidate groups a guess produces - the classic
// "expected information" objective - with the largest group as the tie breaker. Alternatives were
// measured over whole games and were worse: the sum of squared group sizes scored 3.51 on the easy
// standard list against 3.48 for entropy, minimising the largest group 3.54, and an exact
// horizon-aware search restricted to candidate guesses 3.54. Entropy won on the average in every
// mode that was regenerated.
//
// tree-hard-full.js is intentionally NOT regenerated: hard mode over the 12947 word list is over
// budget for a large part of it either way, and the original tree measures better there
// (4.59 average against 4.69). Regenerate it only with a budget-aware search that beats that.
//
// Usage: node scripts/generate-trees.mjs [mode ...]     (modes: es ef hs hf, all by default)

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const solverDir = join(here, '..', 'src', 'lib', 'solver');

const stdWordsList = JSON.parse(readFileSync(join(solverDir, 'std-words-list.json'), 'utf8'));
const fullWordsList = JSON.parse(readFileSync(join(solverDir, 'full-words-list.json'), 'utf8'));

const WORD_SIZE = 5;
const MAX_GUESSES = 6;
const PATTERNS = 3 ** WORD_SIZE;
const PATTERN_SOLVED = PATTERNS - 1;
const MATCH_TYPES = ['b', 'y', 'g'];
// safety net only: a few hard mode lines need more than six guesses and must stay complete
const MAX_DEPTH = 12;

// ---- the feedback encoding, identical to wordleChecker() ---------------------------------
const matchCounts = new Int8Array(128);
const matchDigits = new Int8Array(WORD_SIZE);

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

const patternText = new Map();
function patternToString(pattern) {
  let cached = patternText.get(pattern);

  if (cached === undefined) {
    cached = '';
    let rest = pattern;

    for (let i = 0; i < WORD_SIZE; i += 1) {
      cached = MATCH_TYPES[rest % 3] + cached;
      rest = Math.floor(rest / 3);
    }

    patternText.set(pattern, cached);
  }

  return cached;
}

// ---- the ranking -------------------------------------------------------------------------
const counts = new Int32Array(PATTERNS);
const touchedDigits = new Int32Array(PATTERNS);

// returns the entropy of the groups the guess splits the candidates into, and the largest group
function scoreGuess(guess, candidates) {
  let touchedLength = 0;

  for (let i = 0; i < candidates.length; i += 1) {
    const bucket = patternIndex(guess, candidates[i]);

    if (bucket !== PATTERN_SOLVED) {
      if (counts[bucket] === 0) {
        touchedDigits[touchedLength] = bucket;
        touchedLength += 1;
      }

      counts[bucket] += 1;
    }
  }

  let total = 0;

  for (let i = 0; i < touchedLength; i += 1) {
    total += counts[touchedDigits[i]];
  }

  let entropy = 0;
  let worst = 0;

  for (let i = 0; i < touchedLength; i += 1) {
    const count = counts[touchedDigits[i]];
    const p = count / total;

    counts[touchedDigits[i]] = 0;
    entropy -= p * Math.log2(p);

    if (count > worst) {
      worst = count;
    }
  }

  return { entropy, worst };
}

function splitBy(guess, words) {
  const blocks = new Map();

  for (let i = 0; i < words.length; i += 1) {
    const pattern = patternIndex(guess, words[i]);

    if (pattern !== PATTERN_SOLVED) {
      const block = blocks.get(pattern);

      if (block === undefined) {
        blocks.set(pattern, [words[i]]);
      } else {
        block.push(words[i]);
      }
    }
  }

  return blocks;
}

// the legal hard mode guess pool, mirroring listFilterHard(): revealed greens must keep their
// position and every revealed letter must still occur at least as many times as it was revealed.
// Such a guess is legal even when it is not consistent with the feedback, which is what official
// hard mode allows and what the runtime solver searches.
function hardFilter(list, guess, result) {
  const greens = [];
  const minCounts = {};

  for (let i = 0; i < WORD_SIZE; i += 1) {
    const match = result[i];

    if (match === 'g') {
      greens.push([i, guess[i]]);
      minCounts[guess[i]] = (minCounts[guess[i]] || 0) + 1;
    } else if (match === 'y') {
      minCounts[guess[i]] = (minCounts[guess[i]] || 0) + 1;
    }
  }

  const letters = Object.keys(minCounts);

  return list.filter((word) => {
    for (let i = 0; i < greens.length; i += 1) {
      if (word[greens[i][0]] !== greens[i][1]) {
        return false;
      }
    }

    for (let i = 0; i < letters.length; i += 1) {
      const letter = letters[i];
      let occurrences = 0;

      for (let j = 0; j < WORD_SIZE; j += 1) {
        if (word[j] === letter) {
          occurrences += 1;
        }
      }

      if (occurrences < minCounts[letter]) {
        return false;
      }
    }

    return true;
  });
}

function chooseGuess(candidates, pool, depth, tried) {
  const useCandidates = candidates.length < MAX_GUESSES - depth;
  const basePool = useCandidates ? candidates : pool;
  const untried = basePool.filter((word) => tried.has(word) !== true);
  // if every word of the pool was already tried there is nothing left to gain, so keep the pool
  const guessWords = untried.length > 0 ? untried : basePool;
  let bestEntropy = -Infinity;
  let bestWorst = Infinity;
  let tied = [];

  for (let i = guessWords.length - 1; i >= 0; i -= 1) {
    const word = guessWords[i];
    const { entropy, worst } = scoreGuess(word, candidates);

    if (entropy > bestEntropy || (entropy === bestEntropy && worst < bestWorst)) {
      bestEntropy = entropy;
      bestWorst = worst;
      tied = [word];
    } else if (entropy === bestEntropy && worst === bestWorst) {
      tied.push(word);
    }
  }

  tied.sort((a, b) => (stdWordsList.indexOf(a) === -1 ? 1 : 0) - (stdWordsList.indexOf(b) === -1 ? 1 : 0));

  return tied[0];
}

// ---- tree construction -------------------------------------------------------------------
function buildNode(candidates, pool, hardMode, depth, tried, stats) {
  if (candidates.length === 1) {
    return { word: candidates[0], children: [] };
  }

  if (depth >= MAX_DEPTH) {
    stats.overflow += 1;

    return { word: candidates[0], children: [] };
  }

  const word = chooseGuess(candidates, pool, depth, tried);
  const blocks = splitBy(word, candidates);
  const children = [];
  const nextTried = new Set(tried);

  nextTried.add(word);

  for (const [pattern, block] of blocks) {
    const result = patternToString(pattern);
    const childPool = hardMode ? hardFilter(pool, word, result) : pool;
    const child = buildNode(block, childPool, hardMode, depth + 1, nextTried, stats);

    child.pattern = pattern;
    children.push(child);
  }

  return { word, children };
}

// breadth first indexing keeps the root at index 0
function serialize(root) {
  const order = [root];

  for (let i = 0; i < order.length; i += 1) {
    for (const child of order[i].children) {
      order.push(child);
    }
  }

  const index = new Map(order.map((node, i) => [node, i]));
  const rows = order.map((node, i) => ({
    pattern: i === 0 ? '*****' : patternToString(node.pattern),
    word: node.word,
    first: node.children.length === 0 ? 0 : index.get(node.children[0]),
    next: 0,
    children: node.children,
  }));

  rows.forEach((row) => {
    row.children.forEach((child, ci) => {
      const next = rows[index.get(child)];

      next.next = ci + 1 < row.children.length ? index.get(row.children[ci + 1]) : 0;
    });
  });

  return rows;
}

// walk the serialized tree exactly like wordleSolver() does
function simulate(rows, target) {
  let node = 0;
  let guess = rows[0].word;
  let used = 0;

  while (used < MAX_DEPTH + 3) {
    used += 1;

    const result = patternToString(patternIndex(guess, target));

    if (result === 'ggggg') {
      return { used };
    }

    let next = rows[node].first;

    while (next !== 0 && rows[next].pattern !== '*****' && rows[next].pattern !== result) {
      next = rows[next].next;
    }

    if (next === 0) {
      return { used, fail: 'no-branch' };
    }

    node = next;
    guess = rows[node].word;
  }

  return { used, fail: 'runaway' };
}

function render(mode, rows) {
  const lines = rows.map((row) => `  ['${ row.pattern }', '${ row.word }', ${ row.first }, ${ row.next }],`);

  return `// ${ mode[0] === 'e' ? 'easy' : 'hard' } ${ mode[1] === 's' ? 'std' : 'full' }\n`
    + '// a, g, c, s\n'
    + '// generated by scripts/generate-trees.mjs\n'
    + `export default [\n${ lines.join('\n') }\n];\n`;
}

const modes = process.argv.slice(2).length > 0 ? process.argv.slice(2) : ['es', 'ef', 'hs', 'hf'];

for (const mode of modes) {
  const hardMode = mode[0] === 'h';
  const candidates = mode[1] === 's' ? stdWordsList : fullWordsList;
  const started = Date.now();
  const stats = { overflow: 0 };
  const root = buildNode(candidates, fullWordsList, hardMode, 0, new Set(), stats);
  const rows = serialize(root);
  const name = `tree-${ mode[0] === 'e' ? 'easy' : 'hard' }-${ mode[1] === 's' ? 'std' : 'full' }.js`;

  writeFileSync(join(solverDir, name), render(mode, rows));

  const dist = {};
  let total = 0;
  let fails = 0;
  let worst = 0;

  for (const target of candidates) {
    const { used, fail } = simulate(rows, target);

    total += used;

    if (fail) {
      fails += 1;
    } else {
      dist[used] = (dist[used] || 0) + 1;
      worst = Math.max(worst, used);
    }
  }

  console.log(`${ mode }: rows=${ rows.length } root=${ rows[0].word } avg=${ (total / candidates.length).toFixed(4) } max=${ worst } fails=${ fails } over6=${ Object.entries(dist).filter(([k]) => Number(k) > MAX_GUESSES).reduce((a, [, v]) => a + v, 0) } overflow=${ stats.overflow } dist=${ JSON.stringify(dist) } (${ ((Date.now() - started) / 1000).toFixed(1) }s)`);
}
