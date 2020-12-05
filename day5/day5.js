const { promises: fs } = require('fs');

const MAX_ROWS_INDEX = 127;
const MAX_COLUMNS_INDEX = 7;

run();

async function run() {
  const boardingPassLines = await getInputFromFile('input.txt');
  const boardingPasses = boardingPassLines.map((boardingPass) => {
    return {
      row: getNumber(boardingPass.substr(0, 7), 0, MAX_ROWS_INDEX),
      column: getNumber(boardingPass.substr(7, 3), 0, MAX_COLUMNS_INDEX),
    };
  });

  const seatIDs = boardingPasses.map((boardingPass) => (boardingPass.row * 8) + boardingPass.column);
  const sortedSeats = seatIDs.sort((a, b) => b - a);

  console.log('First result:', sortedSeats[0]);

  const betweenSeats = sortedSeats.filter((seat, index) => {
    if (index === 0 || index === sortedSeats.length - 1) {
      return false;
    }

    return sortedSeats[index - 1] - 1 !== seat || sortedSeats[index + 1] + 1 !== seat;
  });

  const mySeat = betweenSeats[0] - 1;
  console.log('Second result:', mySeat);
}

function getNumber(input, min, max) {
  if (input.length === 0) {
    return min;
  }

  const currentInput = input[0];
  input = input.substr(1);

  if (currentInput === 'F' || currentInput === 'L') {
    const nextMax = max - Math.floor((max - min) / 2) - 1;
    return getNumber(input, min, nextMax);
  }

  if (currentInput === 'B' || currentInput === 'R') {
    const nextMin = min + Math.floor((max - min) / 2) + 1;
    return getNumber(input, nextMin, max);
  }
}

async function getInputFromFile(fileName) {
  const rawInput = await fs.readFile(`${__dirname}/${fileName}`, 'utf8');
  const input = rawInput
    .split('\n');
  return input;
}
