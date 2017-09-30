// Initialize Firebase
// 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
var config = {
	apiKey: 'AIzaSyDcMuwK0OT1zF8VP8U9R0-jWHke6ld5Zoc',
	authDomain: 'ucbxrps.firebaseapp.com',
	databaseURL: 'https://ucbxrps.firebaseio.com',
	projectId: 'ucbxrps',
	storageBucket: 'ucbxrps.appspot.com',
	messagingSenderId: '744827515729'
};

firebase.initializeApp(config);
// 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥

// Store database
var database = firebase.database();

// Initialize the rps object with configurations for game/Firebase
var rps = {
	player1: null,
	player2: null,
	player1Exsists: false,
	player2Exsists: false,
	numChildren: 0,
	thisPlayerID: null,
	playerName: null,
	playerDB: null,
	currentTurn: null,
	update: {}
};

// Set reference to turn child in firebase root
rps.turn = database.ref("turn");
rps.chatroom = database.ref("chatroom");

$(document).ready(function () {

	// Get a reference to the players db
	rps.getPlayers = database.ref('players');

	rps.getPlayers.on('value', function (snap) {

		// Get number of children the players database
		rps.numChildren = snap.numChildren();
		// Check if player1/2 exist
		rps.player1Exsists = snap.child("1").exists();
		rps.player2Exsists = snap.child("2").exists();

		// Update page if player1 exists
		if (rps.player1Exsists) {
			rps.player1 = snap.child("1").val();
			$("h4.player1").text(rps.player1.name);
			$(".gamearea.player1 .scoreboard-wins").text(`Wins: ${rps.player1.wins}`);
			$(".gamearea.player1 .scoreboard-losses").text(`Losses: ${rps.player1.losses}`);
		} else {
			// Reset player1 area if it does not exist in firebase
			$("h4.player1").text("Waiting for Player 1");
			$(".gamearea.player1 .scoreboard-wins").empty();
			$(".gamearea.player1 .scoreboard-losses").empty();
		}
		// Update page if player2 exists
		if (rps.player2Exsists) {
			rps.player2 = snap.child("2").val();
			$("h4.player2").text(rps.player2.name);
			$(".gamearea.player2 .scoreboard-wins").text(`Wins: ${rps.player2.wins}`);
			$(".gamearea.player2 .scoreboard-losses").text(`Losses: ${rps.player2.losses}`);
		} else {
			// Reset player2 area if not in firebase db
			$("h4.player2").text("Waiting for Player 2");
			$(".gamearea.player2 .scoreboard-wins").empty();
			$(".gamearea.player2 .scoreboard-losses").empty();
		}

	});

	// Check numPlayers as people join the game
	rps.getPlayers.on("child_added", function (snap) {
		if (rps.numChildren === 1) {
			// set turn to 1, which starts the game
			rps.turn.set(1);
		}
	});

	// Add player to a new game
	rps.join = function () {
		// Checks for number of players. If no player1, set user to player1
		if (rps.numChildren < 2) {
			if (rps.player1Exsists) {
				rps.thisPlayerID = 2;
			} else {
				rps.thisPlayerID = 1;
			}

			// Create a spot in the database for the current player
			rps.playerDB = database.ref(`/players/${rps.thisPlayerID}`);
			// Create an object in Firebase for the currrent player
			rps.playerDB.set({
				name: rps.playerName,
				wins: 0,
				losses: 0
			});

			// DISCONNECT PLAYERS - this is handled in the game function so it resets for every session
			rps.playerDB.onDisconnect().remove();
			// Delete the turn key, this will reset re-add itself during the next game session
			rps.turn.onDisconnect().remove();
			// Clear chat on disconnect
			rps.chatroom.onDisconnect().set({});	
			// Call updateFormArea tp hide form and display player ID.
			rps.update.formArea(rps.playerName, rps.thisPlayerID);

		} else {
			// Prevent 3+ players
			alert("Game in progress!");
		}

	};

	rps.turn.on("value", function (snap) {
		// Gets current turn from snap
		rps.currentTurn = snap.val();
		console.log("CURRENT TURN", rps.currentTurn);

		// Check if player exists
		if (rps.thisPlayerID) {

			// Update the selection area for player1
			if (rps.currentTurn === 1) {
				// If its the current player's turn, tell them and show choices
				if (rps.currentTurn === rps.thisPlayerID) {
					$(".game-info-text").html("<h2>It's Your Turn!</h2>");
					// Empty the ul at each turn. The setTimeout below will wipe the ul if the empty is included there.
					$(".gamearea.player1 ul.selection").empty();
					$(".gamearea.player1 ul.selection").append(`
					<li data-rps="Rock"><img src="assets/images/rps-icon-rock-250.png"></li>
					<li data-rps="Paper"><img src="assets/images/rps-icon-paper-250.png"></li>
					<li data-rps="Scissors"><img src="assets/images/rps-icon-scissors-250.png"></li>`);
				} else {
					// If it isnt the current players turn, tells them theyre waiting for player one
					$(".game-info-text").html(`<h3>Waiting for ${rps.player1.name} to make a selection.</h3>`);
				}
				// Highlight player1 if turn
				$(".gamearea.player1").css({
					"border": "2px solid #00af40"
				});
				$(".gamearea.player2").css({
					"border": "1px solid #272727"
				});
			} else if (rps.currentTurn === 2) {
				// Update the selection area for player2
				if (rps.currentTurn === rps.thisPlayerID) {
					$(".game-info-text").html("<h2>It's Your Turn!</h2>");
					// Empty the ul at each turn. The setTimeout below will wipe the ul if the empty is included there.
					$(".gamearea.player2 ul.selection").empty();
					$(".gamearea.player2 ul.selection").append(`
					<li data-rps="Rock"><img src="assets/images/rps-icon-rock-250.png"></li>
					<li data-rps="Paper"><img src="assets/images/rps-icon-paper-250.png"></li>
					<li data-rps="Scissors"><img src="assets/images/rps-icon-scissors-250.png"></li>`);
				} else {
					// If it isnt the current players turn, tells them theyre waiting for player two
					$(".game-info-text").html(`<h3>Waiting for ${rps.player2.name} to make a selection.</h3>`);
				}
				// Highlight player2 if turn
				$(".gamearea.player2").css({
					"border": "2px solid #00af40"
				});
				$(".gamearea.player1").css({
					"border": "1px solid #272727"
				});
			} else if (rps.currentTurn === 3) {
				// Call game method
				rps.game(rps.player1.selected, rps.player2.selected);
				// Display player choices
				$(".gamearea.player1 .selected").text(rps.player1.selected);
				$(".gamearea.player2 .selected").text(rps.player2.selected);
				//  Reset game
				setTimeout(function () {
					$("div.selected").empty();
					rps.turn.set(1);
				}, 1000);
			} else {
				$(".game-info-text").html("<h2>Waiting for another player to join.</h2>");
				$("#player2").css("border", "none");
				$("#player1").css("border", "none");
			}
		}
	}); // End Doc ready

	// Game logic. I used the logic from Week 3 on 8/17/2017
	rps.game = function (selection1, selection2) {

		// If players make same selection
		if (selection1 === selection2) {
			rps.update.tie();
		}
		// Determine winner when player's selections differ
		else if (selection1 === "Rock" && selection2 === "Scissors") {
			rps.update.scoreDisplay(1);
		}
		if (selection1 === "Rock" && selection2 === "Paper") {
			rps.update.scoreDisplay(2);
		}
		if (selection1 === "Paper" && selection2 === "Rock") {
			rps.update.scoreDisplay(1);
		}
		if (selection1 === "Paper" && selection2 === "Scissors") {
			rps.update.scoreDisplay(2);
		}
		if (selection1 === "Scissors" && selection2 === "Paper") {
			rps.update.scoreDisplay(1);
		}
		if (selection1 === "Scissors" && selection2 === "Rock") {
			rps.update.scoreDisplay(2);
		}
	}

	rps.chatroom.orderByChild("timestamp").on("child_added", function (snapshot) {
		$("#chatroom").append(`<p>${snapshot.val().name}: ${snapshot.val().message}</p>`);
		$("#chatroom").scrollTop($("#chatroom")[0].scrollHeight);
	});

});

// click handler for submit button
$('#submit').on('click', function (event) {
	event.preventDefault();
	// pass the value from the name field to rps.setPlayer 
	var playerName = $('input#player-name').val();
	// Update player name
	rps.playerName = playerName;
	// Attempt to join a new game
	rps.join();
});

$('#chat-submit').on('click', function (event) {
	// Prevent page reload
	event.preventDefault();
	// Get the player's chat message
	var message = $("#chat-message").val();
	// Push data to firebase chatroom
	rps.chatroom.push({
		name: rps.playerName,
		message: message,
		timestamp: firebase.database.ServerValue.TIMESTAMP,
		pid: rps.thisPlayerID
	});

	$("#chat-message").val("");
});

//Prevent form submission
$('form').on('submit', function (event) {
	// Prevent return/enter from refreshing the page
	event.preventDefault();
});

// function to update the jumbotron and player box
rps.update.formArea = function (name, playerID) {
	$('div.name-area').append(`<h3>Hi, ${name}! You are Player ${playerID}</h3>`);
	$('form').hide();
};

// Update the score for each player
rps.update.scoreDisplay = function (playerNum) {

	$(".ga-title.game-info-text").html(`<h2>${rps[`player${playerNum}`].name}  </h2><h2>Wins!</h2>`);
	console.log("Current P1 Wins:", rps.player1.wins);
	console.log("Current P1 Wins:", rps.player2.wins);
	if (playerNum === 1) {
		// This function runs twice, adding half a point each time :(
		rps.getPlayers.child("1").child("wins").set(rps.player1.wins + .5);
		rps.getPlayers.child("2").child("losses").set(rps.player2.losses + .5);
	} else if (playerNum === 2) {
		// This function runs twice, adding half a point each time :(
		rps.getPlayers.child("2").child("wins").set(rps.player2.wins + .5);
		rps.getPlayers.child("1").child("losses").set(rps.player1.losses + .5);
	} else {
		return false;
	}

};

// Update the tie area for each player
rps.update.tie = function () {
	$(".ga-title.game-info-text").html("<h2>Tie Game!</h2>");
};

// Click event li's added to the page in the game method
$(document).on("click", "li", function () {
// Grabs text from li choice
var selected = $(this).data("rps");
console.log(selected);

// Set rps selected in the user's firebase object
rps.playerDB.child("selected").set(selected);
$(`#player ${rps.thisPlayerID}  ul`).empty();
$(`#player ${rps.thisPlayerID} div.selected`).text(selected);

// Update turn counter in firebase root
rps.turn.transaction(function (currentTurnCount) {
	return currentTurnCount + 1;
});
});