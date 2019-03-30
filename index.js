var GRID_ROWS = 10;
var GRID_COLS = 10;

var SELECTED_CELL_BGCOLOR = "yellow";
var UNSELECTED_CELL_BGCOLOR = "";
var OBSTACLE_CELL_BGCOLOR = "red";

var USER_ICON = "user.jpg";
var COMPUTER_ICON = "computer.jpg";

window.onload = setup;

//set up the variables to save the game state
var currentSelectedBox = "";
var grid;
var currentStage = "setup";
var userRobotPlaced = false;

var rounds = 0;
var users_score = 0;
var computers_score = 0;

function setup() {
	//create the grid and intialize it
    grid = new Array(GRID_ROWS);

    var tbl = "<table id='grid'>";
    for (var i = 0; i < GRID_ROWS; i++) {
        grid[i] = new Array(GRID_COLS);

        tbl += "<tr>";
        for (var j = 0; j < GRID_COLS; j++) {
            tbl += "<td id='" + (i * GRID_COLS + j) + "' onclick='cellClicked(id)'></td>";
            grid[i][j] = "";
        }
        tbl += "</tr>";
    }
    tbl += "</table>";
    document.getElementById("gridArea").innerHTML = tbl;
}

function cellClicked(id) {

    var coord = mapIdToCoordinates(id);

    if (grid[coord[0]][coord[1]] == "") {

        if (currentSelectedBox != "") {
            document.getElementById(currentSelectedBox).style.backgroundColor = UNSELECTED_CELL_BGCOLOR;
        }
		//mark the selected cell as yellow
        currentSelectedBox = id;
        document.getElementById(id).style.backgroundColor = "yellow";
    }
    else {
        displayMessage("Cannot change the cell content.");
    }
}

function mapIdToCoordinates(id) {
	//convert the cell's id into x y coordinates
    id = parseInt(id);
    var x = parseInt(id / GRID_ROWS);
    var y = id - x * GRID_COLS;
    var arr = [];
    arr.push(x);
    arr.push(y);
    return arr;
}

function coordinatesToId(x, y){
	return x * GRID_COLS + y;
}

function displayMessage(msg) {
    document.getElementById("messageBar").innerHTML = msg;
    setTimeout(clearMessageBar, 2000);		//clear the message board after 2 seconds
}

function clearMessageBar() {
    document.getElementById("messageBar").innerHTML = "";
}

function displayResult(msg) {
    document.getElementById("messageBar").innerHTML = msg;
	document.getElementById("messageBar").style.backgroundColor = "yellow";
}

//set up the key handler
document.onkeydown = function (evt) {
    evt = evt || window.event;


    if (currentStage == "setup" && currentSelectedBox != "") {
        if (evt.keyCode >= 49 && evt.keyCode <= 57) {
            //place the treasure
            placeTreasure(currentSelectedBox, evt.keyCode - 48);
            resetSelection();
        }
        else if (evt.keyCode == 79) {
            placeObstacle(currentSelectedBox);
        }
        else if (evt.keyCode == 85) {
            placeUserRobot(currentSelectedBox);
        }
        else {
            displayMessage("Invalid key pressed.");
        }
    }
	else if(currentStage == "play"){
		
		//alert(evt.keyCode);
		
		switch(evt.keyCode) {
			case 65:    //a
				movePlayerRobot("left");
			break;
			case 87:		//w
				movePlayerRobot("up");
			break;
			case 68:	//d
				movePlayerRobot("right");
			break;		
			case 88:	//x
				movePlayerRobot("down");
			break;
			default:
				displayMessage("Invalid key pressed.");
			break;
		
		}
	}
};

function movePlayerRobot(direction) {
	var userCoords = getRobotCoordinates("user");
	var new_x = userCoords[0], new_y = userCoords[1];
	
	if(direction == "left"){
		new_y = userCoords[1] - 1;
	}
	else if(direction == "right"){
		new_y = userCoords[1] + 1;
	}
	else if(direction == "up"){
		new_x = userCoords[0] - 1;
	}
	else if(direction == "down"){
		new_x = userCoords[0] + 1;
	}
	//if the move is valid
	if(new_x < 0 ||  new_x >= GRID_ROWS || new_y < 0 || new_y >= GRID_COLS
		|| grid[new_x][new_y] == "obstacle" || grid[new_x][new_y] == "computer"){
		displayMessage("Invalid move. Your turn is over.");
	}
	else{
		if(containsTreasure(new_x, new_y)) {
				//if the treasure is found
			users_score += parseInt(grid[new_x][new_y]);
			updateScoreBoard();
		}
		//move the user to next cell
		grid[new_x][new_y] = "user";
		grid[userCoords[0]][userCoords[1]] = "";
		document.getElementById(coordinatesToId(userCoords[0], userCoords[1])).style.backgroundImage = "";
		document.getElementById(coordinatesToId(userCoords[0], userCoords[1])).innerHTML = "";
		document.getElementById(coordinatesToId(new_x, new_y)).style.backgroundImage = "url(" + USER_ICON + ")";
		document.getElementById(coordinatesToId(new_x, new_y)).innerHTML = "";
	}
	
	if(gridHasTreasure()){			//if the treasure if not finished yet...
		computerTurn();	
	}
	else{
		endPlay();
	}
} 

function computerTurn(){
	
	var computerCoords = getRobotCoordinates("computer");
	var new_x = computerCoords[0], new_y = computerCoords[1];
	var found = false;
	var empty_cell_x = -1;
	var empty_cell_y = -1;
	
	//check up: makes the computer robot to check up...
	if(computerCoords[0] > 0){
		if(containsTreasure(computerCoords[0] - 1, computerCoords[1])){
			new_x = computerCoords[0] - 1;
			found = true;
		}else if(grid[ computerCoords[0] - 1][ computerCoords[1]] == ""){
			empty_cell_x = computerCoords[0] - 1;
			empty_cell_y = computerCoords[1];
		}
	}
	
	//check down
	if(!found && computerCoords[0] < GRID_ROWS - 1){
		if(containsTreasure(computerCoords[0] + 1, computerCoords[1])){
			new_x = computerCoords[0] + 1;
			found = true;
		}
		else if(grid[computerCoords[0] + 1][computerCoords[1]] == "" && (empty_cell_x == -1 || Math.random() > 0.7 )){
			empty_cell_x = computerCoords[0] + 1;
			empty_cell_y = computerCoords[1];
		}
	}
	
	//check left
	if(!found && computerCoords[1] > 0 ){
		if(containsTreasure(computerCoords[0], computerCoords[1] - 1)){
			new_y = computerCoords[1] - 1;
			found = true;
		}
		else if( grid[computerCoords[0]][computerCoords[1] - 1] == "" && (empty_cell_x == -1 || Math.random() > 0.7 )){
			empty_cell_x = computerCoords[0];
			empty_cell_y = computerCoords[1] - 1;
		}
	}
	
	//check right
	if(!found && computerCoords[1] < GRID_COLS - 1){
		if(containsTreasure(computerCoords[0], computerCoords[1] + 1)){
			new_y = computerCoords[1] + 1;
			found = true;
		}
		else if(grid[computerCoords[0]][computerCoords[1] + 1] == "" && (empty_cell_x == -1 || Math.random() > 0.7 )){
			empty_cell_x = computerCoords[0];
			empty_cell_y = computerCoords[1] + 1;
		}
	}
	
	//check top left
	if(!found && computerCoords[0] > 0 && computerCoords[1] > 0){
		if(containsTreasure(computerCoords[0] - 1, computerCoords[1] - 1)){
			new_x = computerCoords[0] - 1;
			new_y = computerCoords[1] - 1;
			found = true;
		}
		else if(grid[computerCoords[0] - 1][computerCoords[1] - 1] == "" && (empty_cell_x == -1 || Math.random() > 0.7 )){
			empty_cell_x = computerCoords[0] - 1;
			empty_cell_y = computerCoords[1] - 1;
		}
	}
	
	//check top right
	if(!found && computerCoords[0] > 0 && computerCoords[1] < GRID_COLS - 1){
		if(containsTreasure(computerCoords[0] - 1, computerCoords[1] + 1)){
			new_x = computerCoords[0] - 1;
			new_y = computerCoords[1] + 1;
			found = true;
		}
		else if(grid[computerCoords[0] - 1][computerCoords[1] + 1] == "" && (empty_cell_x == -1 || Math.random() > 0.7 )){
			empty_cell_x = computerCoords[0] - 1;
			empty_cell_y = computerCoords[1] + 1;
		}
	}
	
	//check bottom left
	if(!found && computerCoords[0] < GRID_ROWS - 1 && computerCoords[1] > 0){
		if(containsTreasure(computerCoords[0] + 1, computerCoords[1] - 1)){
			new_x = computerCoords[0] + 1;
			new_y = computerCoords[1] - 1;
			found = true;
		}
		else if(grid[computerCoords[0] + 1][computerCoords[1] - 1] == "" && (empty_cell_x == -1 || Math.random() > 0.7 )){
			empty_cell_x = computerCoords[0] + 1;
			empty_cell_y = computerCoords[1] - 1;
		}
	}
	
	//check bottom right
	if( !found && computerCoords[0] < GRID_ROWS - 1 && computerCoords[1] < GRID_COLS - 1){
		if(containsTreasure(computerCoords[0] + 1, computerCoords[1] + 1)){
			new_x = computerCoords[0] + 1;
			new_y = computerCoords[1] + 1;
			found = true;
		}
		else if(grid[computerCoords[0] + 1][computerCoords[1] + 1] == "" && (empty_cell_x == -1 || Math.random() > 0.7 )){
			empty_cell_x = computerCoords[0] + 1;
			empty_cell_y = computerCoords[1] + 1;
		}
	}
	
	if(found) {
		computers_score += parseInt(grid[new_x][new_y]);		//add treasure
	}
	else{
		new_x = empty_cell_x;
		new_y = empty_cell_y;
	}	
	//move to the next cell
	if(found || (empty_cell_x != -1 && empty_cell_y != -1)) {
	
		grid[new_x][new_y] = "computer";
		grid[computerCoords[0]][computerCoords[1]] = "";
		document.getElementById(coordinatesToId(computerCoords[0], computerCoords[1])).style.backgroundImage = "";
		document.getElementById(coordinatesToId(computerCoords[0], computerCoords[1])).innerHTML = "";
		document.getElementById(coordinatesToId(new_x, new_y)).style.backgroundImage = "url(" + COMPUTER_ICON + ")";
		document.getElementById(coordinatesToId(new_x, new_y)).innerHTML = "";
		rounds++;
		updateScoreBoard();
	}
	else{
		endPlay();
	}
	
	if(!gridHasTreasure() || !userCanMove()){
		endPlay();
	}	
}

function userCanMove() {

	//if some user can move to its neighbouring cell
	var userCord = getRobotCoordinates("user");
	
	if(userCord[0] > 0){
		if(containsTreasure(userCord[0] - 1, userCord[1]) || grid[ userCord[0] - 1][ userCord[1]] == ""){
			return true;
		}
	}
	
	//check down
	if(userCord[0] < GRID_ROWS - 1){
		if(containsTreasure(userCord[0] + 1, userCord[1]) || grid[userCord[0] + 1][userCord[1]] == ""){
			return true;
		}
	}
	
	//check left
	if(userCord[1] > 0 ){
		if(containsTreasure(userCord[0], userCord[1] - 1) || grid[userCord[0]][userCord[1] - 1] == ""){
			return true;
		}
	}
	
	//check right
	if(userCord[1] < GRID_COLS - 1){
		if(containsTreasure(userCord[0], userCord[1] + 1) || grid[userCord[0]][userCord[1] + 1] == ""){
			return true;
		}
	}

	return false;
}

function gridHasTreasure() {

	for(var i = 0; i < GRID_ROWS; i++){
		for(var j = 0; j < GRID_COLS; j++){
			if(containsTreasure(i, j)){		//if the treasure is found
				return true;
			}
		}
	}
	return false;
}

function containsTreasure(x, y) {
	if(grid[x][y] != "" && !isNaN(grid[x][y])) {
		return true;
	}
	return false;
}

function getRobotCoordinates(target) {
	var arr = [];
	//return coordinates of given robot
	for(var i =0; i < GRID_ROWS; i++) {
		for(var j = 0; j < GRID_COLS; j++) {
			if(grid[i][j] == target) {
			
				arr.push(i);
				arr.push(j);
			}
		}
	}
	return arr;
}

function placeTreasure(cellId, value) {
	//add the treasure to cell
    document.getElementById(cellId).innerHTML = value;
    var coords = mapIdToCoordinates(cellId);
    grid[coords[0]][coords[1]] = value;
    document.getElementById(currentSelectedBox).style.backgroundColor = UNSELECTED_CELL_BGCOLOR;
    resetSelection();
}

function placeObstacle(cellId) {
	//place the obstacle in the cell
    document.getElementById(cellId).style.backgroundColor = OBSTACLE_CELL_BGCOLOR;
    var coords = mapIdToCoordinates(cellId);
    grid[coords[0]][coords[1]] = "obstacle";
    resetSelection();
}

function placeUserRobot(cellId) {
	//place the robot in the cell
    if (userRobotPlaced == false) {
        document.getElementById(cellId).style.backgroundImage = "url(" + USER_ICON + ")";
		document.getElementById(cellId).style.backgroundColor = UNSELECTED_CELL_BGCOLOR;
        var coords = mapIdToCoordinates(cellId);
        grid[coords[0]][coords[1]] = "user";
        resetSelection();
        userRobotPlaced = true;
    }
    else {
        displayMessage("User robot is already placed.");
    }
}

function resetSelection() {
    currentSelectedBox = "";
}

function endSetup() {
	//finish the setup stage and start the play stage
    if (!userRobotPlaced) {
        displayMessage("Please place user robot before existing setup stage.");
    }
	else{
		updateScoreBoard();
		currentStage = "play";
		placeComputerRobot();
		hidePlayButton();
		showEndButton();
		
		if(currentSelectedBox != ""){
			document.getElementById(currentSelectedBox).style.backgroundColor = UNSELECTED_CELL_BGCOLOR;		//unselect
		}
		//no tresure or no possible movement
		if(!gridHasTreasure() || !userCanMove()){
			endPlay();
		}else{
			displayMessage("Game is started.");
		}		
	}
}

function hidePlayButton() {
	document.getElementById("playBtn").style.display = "none";
}

function showEndButton() {
	document.getElementById("EndBtn").style.display = "inline";
}

function placeComputerRobot() {
	var placed = false;
	
	while(!placed){
		var x = Math.floor((Math.random()*GRID_ROWS));
		var y = Math.floor((Math.random()*GRID_COLS));
		
		if(grid[x][y] == "") {
		
			grid[x][y] = "computer";
			document.getElementById(coordinatesToId(x, y)).style.backgroundImage = "url(" + COMPUTER_ICON + ")";
			placed = true;
		}
	}
}

function endPlay() {

	currentStage = "end";
	
	//check the result of the match
	if(users_score > computers_score){
		displayResult("Congratulations, You Won!!");
	}
	else if(users_score < computers_score){
		displayResult("Oops, You Lose!!");
	}
	else{
		displayResult("Game is draw!!");
	}
	
	document.getElementById("EndBtn").style.display = "none";
}

function updateScoreBoard() {

	//print stats on the scoreboard
	document.getElementById("scoreBoard").style.display = "block";
	document.getElementById("rounds_played").innerHTML = rounds;
	document.getElementById("users_score").innerHTML = users_score;
	document.getElementById("computers_score").innerHTML = computers_score;
}
