const fetch = require('node-fetch');
//создайте приложение https://oauth.yandex.ru/client/new
//получите токен https://oauth.yandex.ru/authorize?response_type=token&client_id=<идентификатор приложения>
//отправьте заявку https://direct.yandex.ru/registered/main.pl?cmd=apiCertificationRequestList
//включите песочницу тут https://direct.yandex.ru/registered/main.pl?cmd=apiApplicationList
const url = 'https://api-sandbox.direct.yandex.ru/v4/json/';

const token = 'ВашТокен_ghDhDHDHG'; ///////редактировать
const login = 'your.login'; ///////редактировать

class WordStatParse {
    constructor(phrases, geoId) {
        this.type = 'post';
        this.phrases = phrases;
        this.GeoID = geoId;

        this.options = {
            method: this.type,
			headers: {'Content-Type': 'application/json'},
            body: {}
          }
    }

    async CreateNewWordstatReport() {
        let body = {
            "method": "CreateNewWordstatReport",
            "param": {
               /* NewWordstatReportInfo */
               "Phrases": this.phrases,
               "GeoID":  this.GeoID
            },
            "token" : token
        }

        this.options.body = JSON.stringify(body);
		
		try {

            let response = await fetch(url, this.options)
			let result = await response.json();
			return result.data;
			
		} catch(err) {
			
			console.log(err);
			
		}
    }

    async GetWordstatReportList() {
            let body = {
                "method": "GetWordstatReportList",
                "token" : token
            }
    
            this.options.body = JSON.stringify(body);
    
			try {

				let response = await fetch(url, this.options)
				let result = await response.json();
				return result;
				
			} catch(err) {
				
				console.log(err);
			}
				
        }

        async deleteWordstatReport(param) {
			
            let body = {
                "method": "DeleteWordstatReport",
                "param" : param,
                "token" : token
            }
    
            this.options.body = JSON.stringify(body);
			
			try {

				let response = await fetch(url, this.options)
				let result = await response.json();
				
				if(result.data == 1) {
                    console.log(`ReportID: ${param} sucessfully deleted.`);
					return;
                } else {
					console.log(`ReportID: ${param} not deleted, try again`);
					console.log(result);
					return false;
				}
				
			} catch(err) {
				
				console.log(err);
			}
		
        }

        async GetWordstatReport(reportId) {
            const body = {
                    "method": "GetWordstatReport",
                    "param" : reportId,
                    "token" : token
                }

            this.options.body = JSON.stringify(body);
			try {

				let response = await fetch(url, this.options)
				let result = await response.json();
				return result;
				
			} catch(err) {
				
				console.log(err);
			}
        }
		
		async GetClientsUnits() {
            const body = {
                    "method": "GetClientsUnits",
                    "param" : [login],
                    "token" : token
                }

            this.options.body = JSON.stringify(body);
			try {

				let response = await fetch(url, this.options)
				let result = await response.json();
				console.log(result);
				if (!result.data) {
					console.log('баллы не получены', result.data);
					return;
				}
				let number = result.data[0].UnitsRest;
				console.log('баллы', number);
				return number;
				
			} catch(err) {
				
				console.log(err);
			}
        }		

        async deleteAllReports(reportList) {
			
			let arr = reportList.data;
			let data = this;
			arr[Symbol.asyncIterator] = function() {
				
				let o1 = {
					
					current: 0,
					last: arr.length-1,
					
					async next() {
						
						if (this.current <= this.last) {
							
							while (await data.deleteWordstatReport(arr[this.current].ReportID) === false) {
								await new Promise((resolve, reject) => {
									
									console.log('Еще попытка удалить отчет');
									setTimeout(() => {
									// переведёт промис в состояние fulfilled с результатом "result"
										resolve("result");
										
									}, 500);
								})									
							}
							return {done: false, value: this.current++}
						
						} else {
							return {done: true}
						}
						
					}
					
				}
				return o1;
			}
			
			for await (let value of arr) {
				
			}
			
        }

}

async function deleteAllReports(){
    let data = new WordStatParse([''], []);
    let allReports;
	while (Array.isArray((allReports = await data.GetWordstatReportList()).data)===false) {
		console.log("GetWordstatReportList отчет с ошибкой, try again");
		console.log(allReports);
		await new Promise((resolve, reject) => {

			setTimeout(() => {
			// переведёт промис в состояние fulfilled с результатом "result"
				resolve("result");
				
			}, 500);
		})		
	}
	//
	console.log(allReports, 1);
	
    await data.deleteAllReports(allReports);
}

async function waiting(data, newReport){
    
    let allReports;
	while (Array.isArray((allReports = await data.GetWordstatReportList()).data)===false) {
		console.log("GetWordstatReportList отчет с ошибкой, try again");
		console.log(allReports);
		await new Promise((resolve, reject) => {

			setTimeout(() => {
			// переведёт промис в состояние fulfilled с результатом "result"
				resolve("result");
				
			}, 500);
		})		
	}	
	
	//
	console.log(allReports, 2);
	
	
	for (let element of allReports.data) {
       if(element.ReportID == newReport){
            if(element.StatusReport == 'Done'){
                console.log(element);
                console.log('Отчет готов!');
                return true;
            }
            else{
                console.log(element);
                console.log('Отчёт еще не готов.');
                return false;
            }
        }		
	}

}

async function dataRequest(data, newReport){
    let result;
	
	while (Array.isArray((result = await data.GetWordstatReport(newReport)).data)===false) {
		console.log("GetWordstatReport отчет с ошибкой, try again");
		console.log(result);
		await new Promise((resolve, reject) => {

			setTimeout(() => {
			// переведёт промис в состояние fulfilled с результатом "result"
				resolve("result");
				
			}, 500);
		})		
	}			
	
//то что нужно
    return result.data[0].SearchedWith[0].Shows;
}

async function getData(phrase) {
    await deleteAllReports();
    let data = new WordStatParse([phrase], []);
    let newReport;
	
	while ((newReport = await data.CreateNewWordstatReport())===undefined) {
		console.log("CreateNewWordstatReport отчет не создан, try again");
		await new Promise((resolve, reject) => {

			setTimeout(() => {
			// переведёт промис в состояние fulfilled с результатом "result"
				resolve("result");
				
			}, 500);
		})		
	}				
	
	await new Promise((resolve, reject) => {

		setTimeout(() => {
		// переведёт промис в состояние fulfilled с результатом "result"
			resolve("result");
			
		}, 5000);
	})
		
	while ( true !== await waiting(data, newReport)) {
		await new Promise((resolve, reject) => {

			setTimeout(() => {
			// переведёт промис в состояние fulfilled с результатом "result"
				resolve("result");
				
			}, 5000);

		});
	}
	
	await data.GetClientsUnits();
	
	return await dataRequest(data,newReport);
	
	
}

module.exports = getData;
