const { promises: fs } = require('fs');

const TREE_SYMBOL = '#';

run();

async function run() {
  const lines = await getInputFromFile('input.txt');
  const grid = generateGrid(lines);
  const encounteredTrees = countTrees(grid, 3, 1);
  console.log('First result', encounteredTrees);

  const encounteredTreesList = [
    countTrees(grid, 1, 1),
    encounteredTrees,
    countTrees(grid, 5, 1),
    countTrees(grid, 7, 1),
    countTrees(grid, 1, 2),
  ];

  const multipliedEncounteredTrees = encounteredTreesList.reduce((multipliedTotal, encountered) => multipliedTotal * encountered, 1);
  console.log('Second result', multipliedEncounteredTrees);
}

function generateGrid(inputLines) {
  const grid = inputLines.map((line) => line.split(''));
  return grid;
}

function countTrees(grid, stepsRight, stepsDown) {
  const totalRows = grid.length;
  const totalColumns = grid[0].length;
  let currentRow = stepsDown;
  let currentColumn = 0;
  let treesEncountered = 0;

  while (currentRow < totalRows) {
    const nextColIndex = currentColumn + stepsRight;
    const rowEndIndex = totalColumns - 1;
    currentColumn = nextColIndex > rowEndIndex ? nextColIndex % totalColumns : nextColIndex;
    if (grid[currentRow][currentColumn] === TREE_SYMBOL) {
      treesEncountered++;
    }
    currentRow += stepsDown;
  }

  return treesEncountered;
}

async function getInputFromFile(fileName) {
  const rawInput = await fs.readFile(`${__dirname}/${fileName}`, 'utf8');
  const input = rawInput
    .split('\n');
  return input;
}
