const footnotes = require('./footnotes')

module.exports = function putAsterisks(footnotes, sentence) {


    const spaces = ' «»,;:"'
    let finalSentence = sentence;
    let alternatives = []
    let firstArr = []
    

    footnotes.forEach(element => {
        alternatives.push(Object.values(element.sourceText))
    });
    alternatives = alternatives.flat()
    let regex = new RegExp('((^|[' + spaces + '])' + alternatives.join('|') + ')($|[' + spaces + '])', 'mig');

    let matches = [...sentence.matchAll(regex)];
    console.log('matches :>> ', matches);

    for (let index = 0; index < matches.length; index++) {

        let tmp = matches[index][1].trim();
        // tmp = tmp.replace(/['«»"]+/g, '')   
        let startIndex = matches[index].index;

        for (let ftn = 0; ftn < footnotes.length; ftn++) {

            if (Object.values(footnotes[ftn].sourceText).includes(tmp) && footnotes[ftn].solve === false) {

                firstArr.push({
                    mathed: tmp,
                    category: footnotes[ftn].cat,
                    startIndex: startIndex
                })

                footnotes[ftn].solve = true
            }
        }
    }
   
    console.log('firstArr :>> ', firstArr);

    let catTypes = [];

    for (let el of firstArr) {
        if (catTypes.includes(el.category)) continue;
        catTypes.push(el.category)
    }
    let separatedArr = [];


    for (let type of catTypes) {
        separatedArr.push(firstArr.filter(item => item.category === type))
    }

    separatedArr = separatedArr.sort((a, b) => {a[0].startIndex - b[0].startIndex})
     

    for (let index in separatedArr) {
        
        
        let moreThanONe = separatedArr[index].map(el => el.mathed)
        console.log('moreThanONe :>> ', moreThanONe);
        moreThanONe.forEach((w) => finalSentence = finalSentence.replace(w, w + '*'.repeat(parseInt(index) + 1)))
    }

    finalSentence = finalSentence.replace(/(\*+)([»"']+)/mig, '$2$1')
   
 return {finalSentence, catTypes}

}

