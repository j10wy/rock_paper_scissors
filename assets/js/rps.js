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

// Create the rps object
var rps = {};

// Create player1/2 and intialize as null
rps.player1 = null;
rps.player2 = null;

// Set player ID to null. ID is set in rps.setPlayer()
rps.thisPlayerID = null;


$(document).ready(function () {

	database.ref().once("value", function() {
		database.ref().set({
			turn: 1
		});
	});

	// Get the number of players who have entered their name
	rps.getPlayers = database.ref('players');

	// Log the number of players as they are added or removed
	rps.getPlayers.on('value', function (snap) {

		// If it exists, store the players object from Firebase
		var playersObj = snap.val();
		if (playersObj) {
			if (playersObj[1] && !rps.player1) {
				// Player1 exists in the database, update rps.player1 and update the page 
				rps.player1 = true;
				$('h4.ga-title.player1').text(playersObj[1].name);
				console.log("playersObj[1]", playersObj[1]);
			} else if (playersObj[2] && !rps.player2) {
				// Player2 exists in the database, update rps.player2 and update the page 
				rps.player2 = true;
				$('h4.ga-title.player2').text(playersObj[2].name);
				console.log("playersObj[2]", playersObj[2]);
			} else {
				// Player1/2 do not exist, clear out the player areas
				console.log("Waiting for players to join");
				$('h4.ga-title.player1').text("Player 1");
				$('h4.ga-title.player2').text("Player 2");
				$('form').show();
			}
		}
	});

	// Set update player information
	rps.setPlayer = function (name) {
		// Figure out if user is player 1 or 2
		var playerID = (!rps.player1 ? 1 : 2);
		rps.thisPlayerID = playerID;
		console.log(">>> You are player", rps['player' + playerID]);

		// Update the database with the users name and info
		database.ref(`players/${playerID}`).set({
			name: name,
			wins: 0,
			losses: 0
		});

		var playerRef = firebase.database().ref(`players/${playerID}`);
		playerRef.onDisconnect().remove();

		// Hide the form and update the page
		$('form').hide();
		rps.UpdatePlayerName(name, playerID);
	}

	// click handler for submit button
	$('#submit').on('click', function (event) {
		event.preventDefault();
		// pass the value from the name field to rps.setPlayer 
		var playerName = $('input#name-input').val();
		rps.setPlayer(playerName);

	});

	// prevent form submission
	// $('form').on('submit', function (event) {
	// 	// Prevent return/enter from refreshing the page
	// 	event.preventDefault();
	// });

	// function to update the jumbotron and player box
	rps.UpdatePlayerName = function UpdatePlayerName(name, playerID) {

		$('div.name-area').append(`<h3>Hi ${name}! You are Player ${playerID}</h3>`);
		$(`h4.ga-title.player${playerID}`).text(name);

	};

});