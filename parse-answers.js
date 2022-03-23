//requiring path and fs modules
const path = require('path');
const fs = require('fs');
//joining path of directory 
const directoryPath = path.join(__dirname, 'docs/survey/answers');
//passsing directoryPath and callback function
const files = fs.readdirSync(directoryPath).filter(file => file !== '.DS_Store' 
  && file !== 'sbrooks@cs.dal.ca.json')
  //listing all files using forEach
const modules = ['ca-bubble', 'ca-grid', 'vsup-bubble', 'vsup-grid'];
const totals = {}
const eights = {}
files.forEach((file, indx) => {
    // console.log(file); 
    const data = fs.readFileSync(directoryPath + '/' + file, 'utf8');
    
    const answers = JSON.parse(data);

    console.log(file, ' - ', answers['participant-num'])
    let result = [];
    modules.forEach(prop => {
      // console.log(prop, ': ' , answers[prop])
      let correctCount = 0;
      for (let indx in answers[prop]) {
        if (answers[prop][indx]) {
          correctCount++;
        }
      }
      totals[prop] = (totals[prop] || 0) + correctCount;
      if (correctCount === 8) {
        eights[prop] = (eights[prop] || 0) + 1
      }
      result.push(prop + ': ' + correctCount);
    })
    console.log(result);
    // console.log(answers)
});

modules.forEach(prop => {
  console.log(prop + ': ' + totals[prop]/files.length, eights[prop])
});

console.log(files.length)
