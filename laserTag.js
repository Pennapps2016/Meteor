Games = new Mongo.Collection('games');

if (Meteor.isClient) {
	Template.watchGame.helpers({});


	Accounts.ui.config({
		passwordSignupFields: "USERNAME_ONLY"
	});


	Template.createGame.events({
		"submit #newGameForm": function (event) {
			lastGame = Games.findOne({}, {sort: {createdAt: -1}});
			numOfPlayers = event.target.numberOfPlayers.value;

			if (lastGame && lastGame.gameNum) {
				gameNum = lastGame.gameNum + 1;
			} else {
				gameNum = 1;
			}
			event.preventDefault();
			players = [];
			for (i = 1; i <= numOfPlayers; i++) {
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

			FlowRouter.go('/game/' + gameNum);
		}
	});

	Template.joinGame.events({
		"submit #joinGameForm": function (event) {
			event.preventDefault();
			gameNumber = event.target.gameNumber.value;
			game = Games.find({"gameNum": gameNumber});

			if (game) {
				FlowRouter.go('/game/' + gameNumber)
			}
		}
	});

	Template.watchGame.helpers({
		"gameNum": function () {
			return FlowRouter.getParam("gameNum");
		},
		"players": function () {
			game = Games.findOne({"gameNum": parseInt(FlowRouter.getParam("gameNum"))});


			if (game && game.players) {
				return game.players;
			}
		},
		"getRandNum": function(){
			return Math.floor(Math.random()*1000);
		},
		"getChart": function () {
			return {
				chart: {
					type: 'solidgauge',
					backgroundColor: null,
					width: 350,
					height: 250,
				},

				title: null,
				backgroundColor: null,
				pane: {
					center: ['50%', '85%'],
					size: '140%',
					startAngle: -90,
					endAngle: 90,
					background: {
						backgroundColor: '#EEE',
						innerRadius: '60%',
						outerRadius: '100%',
						shape: 'arc'
					}
				},

				tooltip: {
					enabled: false
				},

				yAxis: {
					min: 0,
					max: 100,
					color: "#ffffff",
					title: {
						text: 'Health Points'
					},

					stops: [
						[0.9, '#00FF00'],
						[0.5, '#FFFF00'],
						[0.1, '#f44336']
					],
					lineWidth: 0,
					minorTickInterval: null,
					tickPixelInterval: 400,
					tickWidth: 0,
					title: {
						y: -70
					},
					labels: {
						y: 16
					}
				},

				plotOptions: {
					solidgauge: {
						dataLabels: {
							y: 5,
							borderWidth: 0,
							useHTML: true
						}
					}
				},

				credits: {
					enabled: false
				},

				series: [{
					name: 'Health Points',
					data: [this.score],
					dataLabels: {
						format: '<div style="text-align:center"><span style="font-size:25px;color:white">{y}</span><br/>' +
						'<span style="font-size:12px;color:silver">health points</span></div>'
					},
					tooltip: {
						valueSuffix: ' points'
					}
				}]
			};
		}
	});
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
	
	Api.addRoute('newGame/:playerNum', {authRequired: false}, {
	get: function () {
	lastGame = Games.findOne({}, {sort: {createdAt: -1}});
			numOfPlayers = parseInt(this.urlParams.playerNum);

			if (lastGame && lastGame.gameNum) {
				gameNum = lastGame.gameNum + 1;
			} else {
				gameNum = 1;
			}
			players = [];
			for (i = 1; i <= numOfPlayers; i++) {
				players.push({
					'playerNum': i,
					'score': 100
				})
			}
			gameId = Games.insert({
				"numberOfPlayers": numOfPlayers,
				"createdAt": new Date(),
				"gameNum": gameNum,
				"players": players
			});
			return {"gameNum":gameNum};
		}
	})
			

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
