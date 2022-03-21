//requiring path and fs modules
const path = require('path');
const fs = require('fs');
//joining path of directory 
const directoryPath = path.join(__dirname, 'docs/survey/answers');
//passsing directoryPath and callback function
const files = fs.readdirSync (directoryPath)
  //listing all files using forEach
files.forEach((file, indx) => {
    if (file !== '.DS_Store') {
      // console.log(file); 
      const data = fs.readFileSync(directoryPath + '/' + file, 'utf8');
      const answers = JSON.parse(data);
      console.log(file)
      let result = [];
      ['ca-bubble', 'vsup-grid', 'ca-grid', 'vsup-bubble'].forEach(prop => {
        // console.log(prop, ': ' , answers[prop])
        let correctCount = 0;
        for (let indx in answers[prop]) {
          if (answers[prop][indx]) {
            correctCount++;
          }
        }
        result.push(prop + ': ' + correctCount);
      })
      console.log(result);
    }
    // console.log(answers)
});