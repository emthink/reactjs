/**
 * 
 */

var EventEmitter = require('events').EventEmitter;
var NotingDispatcher = require('../dispatcher/NotingDispatcher');
var Utils = require('../commons/utils');
var notings = require('../commons/NotingData');
var _CONSTANT = require('../commons/variables');

var NotingStore = Utils.extend({}, EventEmitter.prototype, {
	create: function(content) {
		var id = Utils.makeUID();
		notings[id] = {
			id: id,
			content: content
		};
	},
	getAllNotings: function() {
		return notings;
	},
	emitChange: function() {
		this.emit(_CONSTANT.CHANGEEVENT);
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

	switch(action.type) {
		case _CONSTANT.CREATE:
			if (content !== '') {
				NotingStore.create(content);
				NotingStore.emitChange();
			} 
			break;
	}
});

module.exports = NotingStore;