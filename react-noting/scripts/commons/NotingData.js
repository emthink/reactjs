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
	title: 'React Router Test',
	content: 'React Router Test'
};
notings['10001FEAngular'] = {
	id: '10001FEAngular',
	title: 'Angular',
	content: 'Angular Router'
};
notings['10001FEBackbone'] = {
	id: '10001FEBackbone',
	title: 'Backbone',
	content: 'Backbone Router'
};
notings['10001FEAngular2'] = {
	id: '10001FEAngular2',
	title: 'Angular 2',
	content: 'Angular 2.x'
};

module.exports = notings;