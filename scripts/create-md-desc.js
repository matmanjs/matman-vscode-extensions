const path = require('path');
const fs = require('fs');

function getJsonData(name) {
  const content = fs.readFileSync(
    path.join(__dirname, `../snippets/${name}`),
    'utf8',
  );

  return JSON.parse(content);
}

function outputMdContent(jsonData) {
  for (const item in jsonData) {
    if (jsonData.hasOwnProperty(item)) {
      const element = jsonData[item];
      console.log(`| \`${element.prefix}\` | ${element.description} |`);
    }
  }
}

[
  'matman.code-snippets',
  'mocha.code-snippets',
  'chai.code-snippets',
  'dwt.code-snippets',
].forEach((item, index) => {
  console.log('');
  console.log(`#### 2.3.${index + 1} ${item}`);
  console.log('');
  console.log('| 指令 |  描述 |');
  console.log('| --- | --- |');
  outputMdContent(getJsonData(item));
});
