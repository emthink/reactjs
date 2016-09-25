/**
 * NotingData.js
 * @description [数据]
 * @Date 2016/09/25
 */

var Utils = require('./utils.js');

var notings = {};

var uid = Utils.makeUID();
notings[uid] = {
	id: uid,
	content: 'React Flux Test'
};

module.exports = notings;