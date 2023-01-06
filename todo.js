let highlightColor = "yellow";

//The array to store all items in the list
let items = []

function init(){
	//Initialize the event handlers
	document.getElementById("additem").addEventListener("click", addItem);
	document.getElementById("removeitem").addEventListener("click", removeItem);
	document.getElementById("highlight").addEventListener("click", highlightItems);

	//removed sorting button because list should always be sorted
	//document.getElementById("sort").addEventListener("click", sortItems);
	
	loadList(); //call function to fill in the list div

	//P5 polling the server
	setInterval(loadList, 5000);
}

//Returns true if an item with that name exists
function isDuplicate(itemName){
	for(let i = 0; i < items.length; i++){
		if(items[i].name === itemName){
			return true;
		}
	}
	return false;
}

//Returns true if an item with that name exists
function findIn(itemName){
	for(let i = 0; i < items.length; i++){
		if(items[i].name === itemName){
			return items[i];
		}
	}
}

// Add handler 
function addItem(){
	//Verify an item name was entered
	let itemName = document.getElementById("itemname").value;
	if(itemName.length == 0){
		alert("You must enter an item name.");
		return;
	}

	//Add a new object to the items array and render
	let xhttp = new XMLHttpRequest();
	xhttp.open("POST", "/list", true);
	xhttp.setRequestHeader('Content-Type', "application/json");
	xhttp.send(JSON.stringify({name:itemName}));
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200){
			loadList();
			document.getElementById("itemname").value = "";
		}else if (this.readyState == 4 && this.status == 304){
			alert("Duplicate not allowed");
		}
	}
	
}

//Removes selected items
//Strategy is actually to build a new array of items to keep
//Then re-assign the items array to this new array

// Remove Handler
function removeItem(){
	let removedItems = [];
	items.forEach(elem =>{
		//If an item isn't checked, we want to keep it
		if(elem.checked){
			removedItems.push(elem);
		}
	});

	let xhttp = new XMLHttpRequest();
	xhttp.open("PUT", "/list", true);
	xhttp.setRequestHeader('Content-Type', 'application/json');
	xhttp.send(JSON.stringify(removedItems));
	console.log(removedItems);
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200){
			loadList();
		}
	}

	//items = newItems;
	//loadList();
}

//Toggles highlight of selected items
function highlightItems(){
	items.forEach(elem =>{
		//If the item is checked, toggle its light property
		if(elem.checked){
			elem.light = !elem.light;
		}
	});
	renderList();
}

//Sort the array, render the list again
function sortItems(){
	items.sort(function(a,b){
		if(a.name < b.name){
			return -1;
		}else if(a.name > b.name){
			return 1;
		}else{
			return 0;
		}
	})
	// renderList();
}

function toggleCheck(){
	//'this' refers to the calling object
	//In this case, the checkbox that was clicked
	//We saved the 'value' property with the item name
	let itemName = this.value;
	items.forEach(elem => {
		if(elem.name === itemName){
			elem.checked = !elem.checked;
			renderList(); //i think this should be outside
			return;
		}
	});
}

//Creates new items list HTML and replaces the old HTML
function renderList(){
	let highlightColor = "yellow";
	
	//Create a new div to hold the list
	//This will replace the old one
	let newList = document.createElement("div");
	newList.id = "list";
	
	//For each item in the array of items
	items.forEach(elem => {
		//Create a new div to be child of 'list' div
		//Set highlighting based on property of item
		let newDiv = document.createElement("div");
		if(elem.light){
			newDiv.style.backgroundColor = highlightColor
		}
		
		//Create and add the new checkbox
		let newItem = document.createElement("input");
		newItem.type = "checkbox";
		newItem.value = elem.name;
		newItem.id = elem.name;
		newItem.checked = elem.checked
		newItem.onclick = toggleCheck;
		newDiv.appendChild(newItem);
	
		//Create and add the new text node (the item name)
		let text = document.createTextNode(elem.name);
		newDiv.appendChild(text);
	
		//Add newly created div to children of list div
		newList.appendChild(newDiv);
	});
	
	let origList = document.getElementById("list");
	origList.parentNode.replaceChild(newList, origList);
}

// moving the todo list on the server
function loadList(){
	console.log("LOAD LIST HAS BEEN CALLED");
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200){
			let result = JSON.parse(this.responseText);
			let newList = [];
			console.log(result);
			result.forEach(elem => {
				if (isDuplicate(elem.name)){
					let temp = findIn(elem.name);
					newList.push({name:elem.name, light:temp.light, checked:temp.checked});
				}else {
					newList.push({name:elem.name, light:false, checked:false});
				}
			});
			items = newList;
			console.log(result);
			sortItems();
			renderList();
		}
	}

	xhttp.open("GET", "/list", true);
	xhttp.send();
	console.log("Reached end");
}