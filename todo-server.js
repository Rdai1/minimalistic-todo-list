
const http = require('http');
const fs = require("fs");

//variable to store the list
let items = [{name: "Dark Souls 3 any % speed run"},{name: "Workout"},{name: "Order Pizza"}];

//Returns true if an item with that name exists
function isDuplicate(itemName){
	for(let i = 0; i < items.length; i++){
		if(items[i].name === itemName){
			return true;
		}
	}
	return false;
}

//Create a server, giving it the handler function
//Request represents the incoming request object
//Response represents the outgoing response object
const server = http.createServer(function (request, response) {
	console.log(request.url);
	if(request.method === "GET"){
		if(request.url === "/" || request.url === "/todo.html"){
			//read the todo.html file and send it back
			fs.readFile("todo.html", function(err, data){
				if(err){
					response.statusCode = 500;
					response.write("Server error.");
					response.end();
					return;
				}
				response.statusCode = 200;
				response.setHeader("Content-Type", "text/html");
				response.write(data);
				response.end();
			});
		}else if(request.url === "/todo.js"){
			//read todo.js file and send it back
			fs.readFile("todo.js", function(err, data){
				if(err){
					response.statusCode = 500;
					response.write("Server error.");
					response.end();
					return;
				}
				response.statusCode = 200;
				response.setHeader("Content-Type", "application/javascript");
				response.write(data);
				response.end();
			});
		}else if (request.url === "/list"){
			// response.writeHead(200, { "Content-Type": items["json"] })
			response.statusCode = 200;
			response.setHeader("Content-Type", "application/json");
			response.end(JSON.stringify(items));
			
		}else{
			response.statusCode = 404;
			response.write("Unknwn resource.");
			response.end();
		}
	}

	else if(request.method === "POST"){
		console.log("HERE");
		if (request.url === "/list"){
			let receivedData = "";
			request.on('data', (chunk) => {
				receivedData += chunk;
			});

			request.on('end', () => {
				let newItem = JSON.parse(receivedData);
				if (!isDuplicate(newItem.name)){
					items.push(newItem);
					response.statusCode = 200;
				}else {
					response.statusCode = 304;
				}
				response.end();
			});
		}
		else {
			response.statusCode = 404;
			response.write("Unknwn resource.");
			response.end();
		}
	}

	else if(request.method === "PUT"){
		if (request.url === "/list"){
			let receivedData = "";
			request.on('data', (chunk) => {
				receivedData += chunk;
			});

			request.on('end', () => {
				let itemsToRemove = JSON.parse(receivedData);
				console.log(itemsToRemove);
				itemsToRemove.forEach(element => {
					for (let i = 0; i < items.length; i++){
						if(items[i].name === element.name){
							console.log(items[i].name);
							console.log(element.name);
							items.splice(i, 1);
							break;
						}
					}
				});
				response.statusCode = 200;
				response.end();
			});
		}
	}
});

//Server listens on port 3000
server.listen(3000);
console.log('Server running at http://127.0.0.1:3000/');