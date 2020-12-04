const { promises: fs } = require('fs');

const EYE_COLORS = ['amb', 'blu', 'brn', 'gry', 'grn', 'hzl', 'oth'];

const REQUIRED_FIELDS = [{
  key: 'byr',
  isValid: (data) => {
    const number = parseInt(data, 10);
    return number <= 2002 && number >= 1920;
  },
}, {
  key: 'iyr',
  isValid: (data) => {
    const number = parseInt(data, 10);
    return number <= 2020 && number >= 2010;
  },
}, {
  key: 'eyr',
  isValid: (data) => {
    const number = parseInt(data, 10);
    return number <= 2030 && number >= 2020;
  },
}, {
  key: 'hgt',
  isValid: (data) => {
    const match = data.match(/^(\d+)((cm)|(in))$/);
    if (!match) {
      return false;
    }

    const [, numberString, unit] = match;
    const number = parseInt(numberString, 10);

    if (unit === 'cm') {
      return number >= 150 && number <= 193;
    }

    if (unit === 'in') {
      return number >= 59 && number <=76;
    }

    return false;
  },
}, {
  key: 'hcl',
  isValid: (data) => {
    return /^#[0-9a-f]{6}$/.test(data);
  },
}, {
  key: 'ecl',
  isValid: (data) => {
    return EYE_COLORS.some((color) => data === color);
  },
}, {
  key: 'pid',
  isValid: (data) => {
    return /^\d{9}$/.test(data);
  },
}]

run();

async function run() {
  const passportsLines = await getInputFromFile('input.txt');
  const passports = convertPassportInfo(passportsLines);
  const validPassports = passports.filter(isValid);
  console.log('First result:', validPassports.length);

  const validDataPassports = passports.filter(isValidData);
  console.log('Second result:', validDataPassports.length);
}

function convertPassportInfo(passportsLines) {
  return passportsLines.map((passportLine) => {
    const singleLine = passportLine.replace(/\n/g, ' ');
    const fields = singleLine.split(' ');
    const passportFields = fields.reduce((passportData, fieldDefinition) => {
      const [key, value] = fieldDefinition.split(':');
      passportData[key] = value;
      return passportData;
    }, {});
    return passportFields;
  });
}

function isValid(passport) {
  return REQUIRED_FIELDS.every((fieldNameDefinition) => passport.hasOwnProperty(fieldNameDefinition.key));
}

function isValidData(passport) {
  return isValid(passport) && REQUIRED_FIELDS.every((fieldNameDefinition) => fieldNameDefinition.isValid(passport[fieldNameDefinition.key]));
}

async function getInputFromFile(fileName) {
  const rawInput = await fs.readFile(`${__dirname}/${fileName}`, 'utf8');
  const input = rawInput
    .split('\n\n');
  return input;
}
