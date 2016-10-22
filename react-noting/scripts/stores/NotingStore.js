/**
 * 
 */

var EventEmitter = require('events').EventEmitter;
var NotingDispatcher = require('../dispatcher/NotingDispatcher');
var Utils = require('../commons/utils');
var notings = require('../commons/NotingData');
var _CONSTANT = require('../commons/variables');

var NotingStore = Utils.extend({}, EventEmitter.prototype, {
	params: {},
	create: function(title, content) {
		var id = this.params.notingID = Utils.makeUID();
		notings[id] = {
			id: id,
			title: title,
			content: content
		};
	},
	getAllNotings: function() {
		return notings;
	},
	emitChange: function(paramsObj) {
		this.emit(_CONSTANT.CHANGEEVENT, {notingID: this.params.notingID});
	},
	bindChangeEvent: function(callback) {
		this.on(_CONSTANT.CHANGEEVENT, callback);
	},
	removeChangeEvent: function(callback) {
		this.removeListener(_CONSTANT.CHANGEEVENT, callback);
	}
});

NotingDispatcher.register(function(action) {
	var content = action && action.content;
	var title = action && action.title;

	switch(action.type) {
		case _CONSTANT.CREATE:
			if (title !== '') {
				NotingStore.create(title, content);
				NotingStore.emitChange();
			} 
			break;
	}
});

module.exports = NotingStore;