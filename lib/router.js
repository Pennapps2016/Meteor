FlowRouter.route('/home', {
	name: 'home',
	action: function() {
		BlazeLayout.render("home");
	}
});

FlowRouter.route('/', {
	action: function() {
		BlazeLayout.render("home");
	}
});

FlowRouter.route('/createGame', {
	name: 'createGame',
	action: function() {
		BlazeLayout.render("createGame");
	}
});

FlowRouter.route('/game/:gameNum', {
	name: 'watchGame',
	action: function() {
		BlazeLayout.render("watchGame");
	}
});

FlowRouter.route('/game', {
	name: 'joinGame',
	action: function() {
		BlazeLayout.render("joinGame");
	}
});