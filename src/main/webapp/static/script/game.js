var Game = base2.Base.extend({
	
	videoplayer: null,
	startTime: null,
	duration: null,
	gameId: null,
	history: null,
	updateIntervalId: null,
	beenPlaying: false,
	lastKnownUserId: CurrentUser.id,
	scoreToBeat: 0,
	
	constructor: function(gameId, video, startTime, scoreToBeat) {
		this.gameId = gameId;
		this.startTime = startTime;
		this.duration = video.duration;
		this.loadTime = new Date().getTime();
		this.scoreToBeat = scoreToBeat;
		
		this.history = new TaggingHistory();

		if (video.playerType == 'NPO') {
			var playerArgs = {
				fragmentID: video.fragmentId,
				startTimeWithinEpisode: video.startTimeWithinEpisode / 1000,
				duration: video.duration / 1000,
				imageUrl: video.imageUrl,
				prid: video.prid,
				title: video.title
			};
			this.videoplayer = new NPOPlayer('video', playerArgs);
		} else if (video.playerType == 'JW') {
			this.videoplayer = new JWPlayer('video', video.imageUrl, video.sourceUrl);
		}

		if (this.videoplayer != null) {
			this.attachHelpArrow();
			this.initVideoPlayer();
			
		}
	},
	attachHelpArrow: function() {
		var input = $('#inputField');
		var arrow = $('#helparrow');
		$('body').click(function(e){
			if (e.target.id == "helparrow" && !arrow.hasClass('dontshow')) {
				input.focus();
			}
			if (!input.is(":focus")) {
				arrow.removeClass('dontshow');
			} else {
				arrow.addClass('dontshow');
			}
		});
	},
	
	initVideoPlayer: function()
	{
		this.setIntroText('<small>Game starts...</small>');
		jQuery('#vid-overlay-screen').addClass('compact-overlay');
		jQuery('#gameCanvas .outside').removeClass('outside');
		jQuery('#playerList').attr('class','container clear-both spaced-top');
		jQuery('#playerList').attr('style','');
		jQuery('#playerList ul').attr('class','clear-both unstyled horizontal row');
		jQuery('#playerList').insertAfter(jQuery('#rightColumn'));
		jQuery('.equal-cols-game').equalHeights('.col-game');

		setTimeout(jQuery.proxy(function() {
			this.videoplayer.addEvent("tick", this.onVideoTick.bind(this));
			this.videoplayer.addEvent("fragmentEnd", this.endGame.bind(this));

			this.videoplayer.play();

			jQuery("#inputField").keydown(jQuery.proxy(this.addTag, this));
			jQuery("#inputField").keydown(jQuery.proxy(this.setStartTime, this));
			}, this), 100); // This delay is a fix for a bug in IE7/8
	},
	
	getRealTimeElapsed: function() {
		var supposedVideoStartTime = this.loadTime - this.startTime;
		var now = new Date().getTime();
		return now - supposedVideoStartTime;
	},
	
	setRemainingText: function(s) {
		if (jQuery("#timer-remaining").html() != s) {
			jQuery("#timer-remaining").html(s);
		}
	},
	setIntroText: function(s) {
		if (jQuery("#timer-intro").html() != s) {
			jQuery("#timer-intro").html(s);
		}
	},
	
	cleanTag: function(tagName)
	{
		return tagName.trim().replace(/\s+/g, " ");
	},
	
	isValidTag: function(tagName) {
		return tagName;
	},
	
	setStartTime: function(evt) {
		if (evt.keyCode != 13 && evt.target.value.length == 0)
			this.tagStartTime = this.videoplayer.getElapsed();
	},
	
	addTag: function(evt) {
		if (evt.keyCode == 13) {
			var tagName = this.cleanTag(evt.target.value);
			var time = this.videoplayer.getElapsed();
			// store tag if not already added
			if (this.isValidTag(tagName)) {
				jQuery.ajax("/tag-entry", {
					type: "POST",
					success:
						jQuery.proxy(function(tagEntryJson) {
							// add tag to history
							if (tagEntryJson) {
								this.history.update([tagEntryJson]);
							}
						}, this),
					data:
						{
							tag: tagName,
							gameTime: time,
							typingDuration: time - this.tagStartTime,
							'game.id': this.gameId
						}
				});
			}
		}
		if (evt.keyCode == 27 || evt.keyCode == 13)
			document.getElementById("inputField").value = "";
	},
	
	onVideoTick: function(elapsed, duration) {
		// update view
		if (elapsed > 0 || !this.beenPlaying) {
			if(jQuery('#vid-overlay-screen').hasClass('show')){ 
				jQuery('#vid-overlay-screen').removeClass('show').addClass('hide');
				jQuery("#inputField").focus();	
			}
			var prettyRemaining = '<small>Time left </small><strong>' + Utils.prettyPrintTime(duration - elapsed) + '</strong>';
			if (jQuery("#timer-remaining").html() != prettyRemaining) {
				jQuery("#timer-remaining").html(prettyRemaining);
			}
		}
	},
	
	endGame: function() {
		clearInterval(this.updateIntervalId);
		var url = "/game/" + this.gameId + "/recap/" + this.lastKnownUserId;
		if (this.scoreToBeat) url += "#challenge";
		location.href = url;
	}
	
});

var Scoreboard = base2.Base.extend({
	idPrefix : 'player-',

	update : function(players, ownId) {
		jQuery('#playerPositionTotal').text(players.length > 0 ? players.length : '-');
		
		var playersById = {};
		var idPrefix = this.idPrefix;

		jQuery.each(players, function(index, player) {
			var you = player.id == ownId;
			if (you) {
				jQuery('#playerPositionMine').text(index + 1);
			}
			playersById[player.id] = player;
			var elId = idPrefix + player.id;
			var el = jQuery('#' + elId);
			if (el.length == 0) {
				el = jQuery('<li/>', { 'id' : elId, 'class' : you ? 'chart-entry highlight' : 'chart-entry' });
				el.append(jQuery('<span/>', { 'class' : 'index pull-left' }));
				var avatarSpan = jQuery('<span/>', { 'class' : 'avatar' });
				avatarSpan.append(jQuery('<img/>', { src : player.smallAvatarUrl }));
				el.append(avatarSpan);
				el.append(player.name ? player.name : 'Anonymous');
			}
			jQuery('.index', el).text(index + 1);
			jQuery('#playerList ul').append(el);
		});

		jQuery('#playerList ul li').each(function(i, el) {
			el = jQuery(el);
			var elId = el.attr('id');
			if (elId.indexOf(idPrefix) === 0) {
				var playerId = parseInt(elId.substring(idPrefix.length));
				if (!playersById[playerId]) {
					el.detach();
				}
			}
		});
	}

});