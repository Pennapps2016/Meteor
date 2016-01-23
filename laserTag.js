Games = new Mongo.Collection('games');

if (Meteor.isClient) {
	Accounts.ui.config({
		passwordSignupFields: "USERNAME_ONLY"
	});

	Template.createGame.events({
		"submit #newGameForm": function(event){
			lastGame = Games.findOne({}, {sort: {createdAt: -1}});
			numOfPlayers = event.target.numberOfPlayers.value;

			if (lastGame && lastGame.gameNum){
				gameNum = lastGame.gameNum+1;
			} else {
				gameNum = 1;
			}
			event.preventDefault();
			players = [];
			for (i = 1; i <= numOfPlayers; i++){
				players.push({
					'playerNum': i,
					'score': 100
				})
			}
			Games.insert({
				"numberOfPlayers": numOfPlayers,
				"createdAt": new Date(),
				"gameNum": gameNum,
				"players": players
			});

			FlowRouter.go('/game/'+gameNum);
		}
	});

	Template.joinGame.events({
		"submit #joinGameForm": function(event){
			event.preventDefault();
			gameNumber = event.target.gameNumber.value;
			game = Games.find({"gameNum": gameNumber});

			if (game){
				FlowRouter.go('/game/'+gameNumber)
			}
		}
	});

	Template.watchGame.helpers({
		"gameNum": function(){
			return FlowRouter.getParam("gameNum");
		},
		"players": function(){
			game = Games.findOne({"gameNum": parseInt(FlowRouter.getParam("gameNum"))});

			if (game && game.players){
				return game.players;
			}
		}
	})
}

if (Meteor.isServer) {
	Meteor.startup(function () {
		if (Meteor.users.find().count() === 0 ) {
			Accounts.createUser({
				username: 'team',
				email: 'max@mzmtech.com',
				password: 'appleisgod',
				profile: {
					first_name: 'Shoot At',
					last_name: 'Me',
					company: 'Shoot At Me Team'
				}
			});
		}
	});

	var Api = new Restivus({
		useDefaultAuth: true,
		prettyJson: true
	});

	Api.addRoute(':gameId/:playerNum/:points', {authRequired: false}, {
		get: function () {
			game = Games.findOne({"gameNum": parseInt(this.urlParams.gameId)});
			players = game.players;
			if (game){
				for (var key in players) {
					player = players[key];
					if (parseInt(player.playerNum) == parseInt(this.urlParams.playerNum)) {
						calculated_score = parseInt(player.score) - parseInt(this.urlParams.points);
						if (calculated_score < 0){
							calculated_score = 0;
						}
						player.score = calculated_score;
					}
				}
				gameUpdated = Games.update(game._id, {
					$set: {
						"players": game.players
					}
				});

				game = Games.findOne({"gameNum": parseInt(this.urlParams.gameId)});
				return game;
			} else{
				return false;
			}
		},
	});
}
