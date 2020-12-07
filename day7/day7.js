const { promises: fs } = require('fs');
const { expect } = require('chai');

run();

async function run() {
  const ruleLines = await getInputFromFile('input.txt');
  const rules = parseRules(ruleLines);
  const outerBagColors = getOuterBagsColors(rules, 'shiny gold');
  console.log('First result', outerBagColors.length);

  const totalBagsNeeded = getTotalBagsNeeded(rules, 'shiny gold');
  console.log('Second result', totalBagsNeeded);
}

function parseRules(ruleLines) {
  const regex = /^(.+)\sbags contain\s(.+)/;
  const listRegex = /(\d)\s(.+)\sbags?/;
  const rules = {};
  ruleLines.forEach((ruleLine) => {
    const [, name, list] = ruleLine.match(regex);
    rules[name] = rules[name] || [];

    const subBagsList = list.split(',');
    subBagsList.forEach((bagDefinitionString) => {
      const matches = bagDefinitionString.match(listRegex);
      if (!matches) {
        return;
      }

      const bagDefinition = {
        amount: parseInt(matches[1], 10),
        color: matches[2],
      }
      rules[name].push(bagDefinition);
    });
  });

  return rules;
}

function getOuterBagsColors(rules, targetColor) {
  return Object.keys(rules)
    .filter((color) => canContainColor(rules, color, targetColor))
}

function canContainColor(rules, color, targetColor) {
  if (!rules[color]) {
    return false;
  }

  if (rules[color].find((bagDefinition) => bagDefinition.color === targetColor)) {
    return true;
  }

  if (rules[color].some((bagDefinition) => canContainColor(rules, bagDefinition.color, targetColor))) {
    return true;
  }

  return false;
}

function getTotalBagsNeeded(rules, color) {
  if (!rules[color]) {
    return 0;
  }

  return rules[color].reduce((count, definition) => count + (definition.amount * (1 + getTotalBagsNeeded(rules, definition.color))), 0);
}

async function getInputFromFile(fileName) {
  const rawInput = await fs.readFile(`${__dirname}/${fileName}`, 'utf8');
  const input = rawInput
    .split('\n');
  return input;
}


describe('Rules', () => {
  it('should parse all rules into colors', () => {
    const rawRules = [
      'mirrored white bags contain 4 clear gold bags, 1 dark teal bag.',
      'pale indigo bags contain 4 shiny magenta bags, 1 shiny maroon bag.',
    ];
    const rules = parseRules(rawRules);
    expect(Object.keys(rules).length).to.equal(2);
  });

  it('should parse rule with sub bags', () => {
    const rawRules = [
      'mirrored white bags contain 4 clear gold bags, 1 dark teal bag.',
    ];
    const rules = parseRules(rawRules);
    expect(Object.keys(rules).length).to.equal(1);
    expect(rules).to.deep.equal({
      'mirrored white': [{
        amount: 4,
        color: 'clear gold',
      }, {
        amount: 1,
        color: 'dark teal',
      }],
    });
  });

  it('should parse rule with no sub bags', () => {
    const rawRules = [
      'posh plum bags contain no other bags.',
    ];
    const rules = parseRules(rawRules);
    expect(Object.keys(rules).length).to.equal(1);
    expect(rules).to.deep.equal({
      'posh plum': [],
    });
  });

  it('should parse rule with parent mentioned', () => {
    const rawRules = [
      'posh plum bags contain no other bags.',
      'white bags contain 2 posh plum bags.',
    ];
    const rules = parseRules(rawRules);
    expect(Object.keys(rules).length).to.equal(2);
    expect(rules).to.deep.equal({
      'posh plum': [],
      'white': [{
        amount: 2,
        color: 'posh plum',
      }],
    });
  });
});

describe('canContainColor', () => {
  it('should evaluate if color can contain other color', () => {
    const rules = {
      'blue': [{
        amount: 1,
        color: 'posh plum',
      }],
    };

    const outerBagColors = canContainColor(rules, 'blue', 'posh plum');
    expect(outerBagColors).to.equal(true);
  });

  it('should evaluate if color can contain other color over multiple steps', () => {
    const rules = {
      'posh plum': [{
        amount: 1,
        color: 'white',
       }, {
         amount: 1,
         color: 'yellow',
       }],
      'blue': [{
        amount: 1,
        color: 'posh plum',
      }],
    };

    const outerBagColors = canContainColor(rules, 'blue', 'yellow');
    expect(outerBagColors).to.equal(true);
  });
});

describe('Counter', () => {
  it('should get all outer bag colors', () => {
    // Blue -> Posh Plum -> White
    // Blue -> Posh Plum -> Yellow
    const rules = {
      'white': [{
        amount: 1,
        color: 'posh plum',
      }],
       'yellow': [{
        amount: 1,
        color: 'posh plum',
      }],
      'posh plum': [{
        amount: 1,
        color: 'blue',
      }],
    };

    const outerBagColors = getOuterBagsColors(rules, 'blue');
    expect(outerBagColors).to.deep.equal(['white', 'yellow', 'posh plum']);
  });

  it('should get all outer bag colors without non-path colors', () => {
    // Blue -> Posh Plum -> White
    // Blue -> Posh Plum -> Yellow
    const rules = {
      'white': [{
        amount: 1,
        color: 'posh plum',
      }],
       'yellow': [{
        amount: 1,
        color: 'posh plum',
      }],
      'posh plum': [{
        amount: 1,
        color: 'blue',
      }],
      'red': [{
        amount: 1,
        color: 'violet',
       }],
       'violet': [],
    };

    const outerBagColors = getOuterBagsColors(rules, 'blue');
    expect(outerBagColors).to.deep.equal(['white', 'yellow', 'posh plum']);
  });

  it('should get number of bags within', () => {
    const rules = {
      'white': [{
        amount: 2,
        color: 'posh plum',
      }, {
        amount: 4,
        color: 'red',
      }],
       'yellow': [{
        amount: 1,
        color: 'posh plum',
      }],
      'posh plum': [{
        amount: 3,
        color: 'blue',
      }],
      'blue': [{
        amount: 1,
        color: 'violet',
      }],
      'violet': [],
      'red': [],
    };

    // White -> 2 Posh Plum -> 2*3 Blue -> 2*3*1 violet each = 2 + 2*3 + 2*3*1 = 14
    // White -> 4 Red = 4
    // Total: 14 + 4 = 18
    const totalBagsNeeded = getTotalBagsNeeded(rules, 'white');
    expect(totalBagsNeeded).to.equal(18);
  });
});
