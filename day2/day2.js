const { promises: fs } = require('fs');

run();

async function run() {
  const lines = await getInputFromFile('input.txt');
  const validPasswords = lines.filter(isPasswordValid);
  console.log('First result:', validPasswords.length);

  const secondValidPasswords = lines.filter(isPasswordValidExtended);
  console.log('Second result:', secondValidPasswords.length);
}

function isPasswordValid(line) {
  if (!line) {
    return false;
  }

  const [requirements, password] = line.split(': ');
  const [occurancesDefinition, letter] = requirements.split(' ');
  const [min, max] = getNumbersFromString(occurancesDefinition);
  const occurances = countOccurances(letter, password);
  return max >= occurances && occurances >= min;
}

function isPasswordValidExtended(line) {
  if (!line) {
    return false;
  }

  const [requirements, password] = line.split(': ');
  const [occurancesDefinition, letter] = requirements.split(' ');
  const [firstIndex, secondIndex] = getNumbersFromString(occurancesDefinition);
  const valid = checkPositions(firstIndex, secondIndex, letter, password);
  return valid;
}

function getNumbersFromString(occurances) {
  return occurances.split('-').map((numberString) => parseInt(numberString, 10));
}

function countOccurances(letter, password) {
  const withoutLetter = password.replace(new RegExp(letter, 'g'), '');
  return password.length - withoutLetter.length;
}

function checkPositions(firstIndex, secondIndex, letter, password) {
  const letterAtFirstIndex = password[firstIndex - 1];
  const letterAtSecondIndex = password[secondIndex - 1];

  if (letterAtFirstIndex === letter && letterAtSecondIndex === letter) {
    return false;
  }

  return letterAtFirstIndex === letter || letterAtSecondIndex === letter;
}

async function getInputFromFile(fileName) {
  const rawInput = await fs.readFile(`${__dirname}/${fileName}`, 'utf8');
  const input = rawInput
    .split('\n');
  return input;
}
