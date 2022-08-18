const getData = require('./api.js');
const fs = require("fs");

let stream = fs.createWriteStream('./data/result.txt', {flags: "a"});

let wordsListText = '';
let wordsList;
let wordsListLength;
let current = 0; //сколько готово, можно менять
				//пустая строка в конце столбца не считается


let readStream = fs.createReadStream('./data/read.txt');
readStream.on('data', (data)=>{
	wordsListText+=data;
});
readStream.on('end', async ()=>{
	wordsList = wordsListText.split('\r\n');
	wordsListText = '';
	wordsListLength = wordsList.length;

	wordsList[Symbol.asyncIterator] = function() {
		
		let o1 = {
			
			current,
			last: wordsList.length-1,
			
			async next() {
				
				if (this.current <= this.last) {
					let data = {};
					data.phrase = wordsList[this.current];
					
					data.number = await getData(wordsList[this.current++]);
					
					data.log = this.current;
					
					return {done: false, value: data}
				} else {
					return {done: true}
				}
				
			}
			
		}
		return o1;
	}
	
	for await (let data of wordsList) {
		console.log(data.log, 'готово', data.phrase, data.number);
		if (data.log<wordsListLength) {
			stream.write(`${data.number}\n`);					
		} else {
			stream.end(`${data.number}`);
		}		
	}	
});
