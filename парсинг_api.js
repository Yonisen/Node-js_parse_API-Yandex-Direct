const getData = require('./api.js');
const fs = require("fs");

let stream = fs.createWriteStream('./data/result.txt', {flags: "a"});

let wordsListTextBasic = '';
let wordsListBasic;
let wordsListIterable = [];
let wordsListBasicLength;
const geoId = [];
let current = 0;	//можно менять
					//значение это количество строк в result.txt
					//пустая строка в конце не считается


let readStream = fs.createReadStream('./data/read.txt');
readStream.on('data', (data)=>{
	wordsListTextBasic+=data;
});
readStream.on('end', async ()=>{
	wordsListBasic = wordsListTextBasic.split('\r\n');
	wordsListTextBasic = '';
	
	wordsListBasicLength = wordsListBasic.length;
	
	if (current !== 0) {
		wordsListBasic = wordsListBasic.slice(current);
	}
	
	let i=0;
	let y = 0;
	
	for (let item of wordsListBasic) {
		if (i==10) {
			i=0;
			y++;
		}
		if (i == 0) {
			wordsListIterable[y] = [item];
		} else {
			wordsListIterable[y][i] = item;
		}
		i++;
	}

	wordsListIterable[Symbol.asyncIterator] = function() {
		
		let o1 = {
			
			current: 0,
			last: wordsListIterable.length-1,
			
			async next() {
				
				if (this.current <= this.last) {
					
					let data = await getData(wordsListIterable[this.current++], geoId);					
					
					return {done: false, value: data}
				} else {
					return {done: true}
				}
				
			}
			
		}
		return o1;
	}
	
	for await (let data of wordsListIterable) {
		console.log(current+=data.length, 'готово');
		if (current<wordsListBasicLength) {
			stream.write(`${data.string}\n`);					
		} else {
			stream.end(`${data.string}`);
		}		
	}
});
