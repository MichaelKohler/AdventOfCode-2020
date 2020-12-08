const { promises: fs } = require('fs');
const { expect } = require('chai');

const INITIAL_ACC = 0;

run();

async function run() {
  const programLines = await getInputFromFile('input.txt');
  const operations = parseProgramLines(programLines);
  const finalAccumulator = runProgram(operations, INITIAL_ACC);
  console.log('First result:', finalAccumulator);

  const secondRunOperations = parseProgramLines(programLines);
  bruteforcePartTwo(secondRunOperations);
}

function parseProgramLines(rawLines) {
  return rawLines.map((line) => {
    const [operation, value] = line.split(' ');

    return {
      operation,
      value: parseInt(value, 10),
    }
  });
}

function runProgram(operationDefinitions, accumulator, options = {}) {
  const alreadyExecuted = {};
  const operations = operationDefinitions.slice(0, operationDefinitions.length);
  let currentProgramCounter = 0;
  let currentAccumulator = accumulator;
  const runThrough = typeof options.runThrough === 'undefined' ? false : options.runThrough;

  while (currentProgramCounter < operations.length) {
    if (!runThrough && alreadyExecuted[currentProgramCounter]) {
      return currentAccumulator;
    }

    if (runThrough && alreadyExecuted[currentProgramCounter]) {
      return;
    }

    const nextOperation = operations[currentProgramCounter];
    const { operation, value } = nextOperation;
    alreadyExecuted[currentProgramCounter] = true;
    switch (operation) {
      case 'acc': {
        currentAccumulator += value;
        currentProgramCounter++;
        break;
      }
      case 'nop': {
        currentProgramCounter++;
        break;
      }
      case 'jmp': {
        currentProgramCounter = currentProgramCounter + value;
      }
    }
  }

  return currentAccumulator;
}

// There possibly are better data structures fitted for this, but given the limited input I've decided to bruteforce it
function bruteforcePartTwo(secondRunOperations) {
  secondRunOperations.forEach((operationDefinition) => {
    operationDefinition.isExecuted = false;
    if (operationDefinition.operation === 'jmp' || operationDefinition.operation === 'nop') {
      operationDefinition.operation = (operationDefinition.operation === 'jmp') ? 'nop' : 'jmp';
      const finalAcc = runProgram(secondRunOperations, INITIAL_ACC, { runThrough: true });
      // Restore
      operationDefinition.operation = (operationDefinition.operation === 'jmp') ? 'nop' : 'jmp';

      if (typeof finalAcc !== 'undefined') {
        console.log('Second result:', finalAcc);
      }
    }
  });
}

async function getInputFromFile(fileName) {
  const rawInput = await fs.readFile(`${__dirname}/${fileName}`, 'utf8');
  const input = rawInput
    .split('\n');
  return input;
}


describe('Parsing', () => {
  it('should parse all lines', () => {
    const rawInput = [
      'acc +1',
      'acc -2',
      'nop +276',
    ];
    const programLines = parseProgramLines(rawInput);
    expect(programLines.length).to.equal(3);
  });

  it('should set operations correctly', () => {
    const rawInput = [
      'acc +1',
      'nop +276',
      'jmp -1',
    ];
    const programLines = parseProgramLines(rawInput);
    expect(programLines.length).to.equal(3);
    expect(programLines).to.deep.equal([{
      operation: 'acc',
      value: 1,
    }, {
      operation: 'nop',
      value: 276,
    }, {
      operation: 'jmp',
      value: -1,
    }]);
  });
});

describe('Running', () => {
  it('should correctly increase acc', () => {
    const programLines = [{
      operation: 'acc',
      value: 1,
    }, {
      operation: 'acc',
      value: 2,
    }];
    const acc = 0;
    const finalAcc = runProgram(programLines, acc);
    expect(finalAcc).to.equal(3);
  });

  it('should correctly decrease acc', () => {
    const programLines = [{
      operation: 'acc',
      value: -1,
    }, {
      operation: 'acc',
      value: -2,
    }];
    const acc = 0;
    const finalAcc = runProgram(programLines, acc);
    expect(finalAcc).to.equal(-3);
  });

  it('should not do anything for nop', () => {
    const programLines = [{
      operation: 'acc',
      value: 1,
    }, {
      operation: 'nop',
      value: 2,
    }];
    const acc = 0;
    const finalAcc = runProgram(programLines, acc);
    expect(finalAcc).to.equal(1);
  });

  it('should correctly jump back and finish', () => {
    const programLines = [{
      operation: 'acc',
      value: 1,
    }, {
      operation: 'acc',
      value: 3,
    }, {
      operation: 'acc',
      value: 3,
    }, {
      operation: 'jmp',
      value: -2,
    }];
    const acc = 0;
    const finalAcc = runProgram(programLines, acc);
    expect(finalAcc).to.equal(7);
  });

  it('should correctly jump forward', () => {
    const programLines = [{
      operation: 'acc',
      value: 1,
    }, {
      operation: 'jmp',
      value: 2,
    }, {
      operation: 'acc',
      value: 3,
    }, {
      operation: 'acc',
      value: 2,
    }];
    const acc = 0;
    const finalAcc = runProgram(programLines, acc);
    expect(finalAcc).to.equal(3);
  });

  it('should not fail when jumping over end of program', () => {
    const programLines = [{
      operation: 'acc',
      value: 1,
    }, {
      operation: 'jmp',
      value: 2,
    }, {
      operation: 'acc',
      value: 3,
    }];
    const acc = 0;
    const finalAcc = runProgram(programLines, acc);
    expect(finalAcc).to.equal(1);
  });
});
