const { promises: fs } = require('fs');

run();

async function run() {
  const linesSplitByGroups = await getInputFromFile('input.txt');
  const byGroup = linesSplitByGroups.map(getQuestionsForFullGroup);

  const totalQuestionsSummed = byGroup.reduce(sumUniqueQuestions, 0);
  console.log('First result:', totalQuestionsSummed);

  const yesFromEveryone = byGroup.reduce(sumAllYesQuestions, 0);
  console.log('Second result:', yesFromEveryone);
}

function getQuestionsForFullGroup(group) {
  const byPerson = group.split('\n');
  return {
    questions: byPerson.reduce((allQuestions, personAnswers) => {
      allQuestions += personAnswers;
      return allQuestions;
    }, ''),
    totalMembersInGroup: byPerson.length,
  };
}

function sumUniqueQuestions(total, groupAnswers) {
  const uniqueQuestions = new Set(groupAnswers.questions.split(''));
  total += uniqueQuestions.size;
  return total;
}

function sumAllYesQuestions(total, group) {
  const totalMembers = group.totalMembersInGroup;
  if (group.questions.length < totalMembers) {
    return total;
  }

  // this could be done better...
  const questionMap = calculateOccuranceByQuestion(group.questions);
  const totalFromGroup = Object.values(questionMap).reduce((groupTotal, answerOccurances) => {
    if (answerOccurances === totalMembers) {
      groupTotal++;
    }

    return groupTotal;
  }, 0);

  total += totalFromGroup;

  return total;
}

function calculateOccuranceByQuestion(questions) {
  const map = {};
  questions.split('').forEach((questionLetter) => {
    map[questionLetter] = typeof map[questionLetter] === 'undefined' ? 1 : map[questionLetter] + 1;
  });

  return map;
}

async function getInputFromFile(fileName) {
  const rawInput = await fs.readFile(`${__dirname}/${fileName}`, 'utf8');
  const input = rawInput
    .split('\n\n');
  return input;
}
