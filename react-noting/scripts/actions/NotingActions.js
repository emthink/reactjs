/**
 * NotingActions.js
 * @description [Noting Action]
 * @author [惊鸿]
 * @link [symbol]
 * @date 2016/09/24
 */


var NotingDispatcher = require('../dispatcher/NotingDispatcher');
var _CONSTANT = require('../commons/variables');

var NotingActions = {
	create: function(title, content) {
		NotingDispatcher.dispatch({
			type: _CONSTANT.CREATE,
			title: title,
			content: content
		});
	}
};

module.exports = NotingActions;