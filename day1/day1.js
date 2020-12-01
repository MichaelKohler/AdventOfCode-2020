const { promises: fs } = require('fs');

const TOTAL = 2020;

run();

async function run() {
  const input = await getInputFromFile('input.txt');

  const [first, second] = getPairSummedTotal(TOTAL, input);
  console.log('1. Result', first * second);

  const [one, two, three] = getThreeSummedTotal(TOTAL, input);
  console.log('2. Result', one * two * three);
}

async function getInputFromFile(fileName) {
  const rawInput = await fs.readFile(`${__dirname}/${fileName}`, 'utf8');
  const input = new Set(rawInput
    .split('\n')
    .map((number) => parseInt(number, 10))
    .filter((number) => !Number.isNaN(number)));
  return input;
}

function getPairSummedTotal(total, input) {
  for (const number of input.values()) {
    const remaining = total - number;
    if (input.has(remaining)) {
      return [number, remaining];
    }
  }

  throw new Error(`No pair found summing up to requested amount of ${total}`);
}

function getThreeSummedTotal(total, input) {
  for (const number of input.values()) {
    const remaining = total - number;

    try {
      const pairForRemaining = getPairSummedTotal(remaining, input);
      return [number, ...pairForRemaining];
    } catch (error) {}
  }

  throw new Error(`No pair found summing up to requested amount of ${total}`);
}
