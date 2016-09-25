/**
 * utils.js
 * @description [工具函数模块]
 * @Date 2016/09/24
 */

var Utils = {
	isPlainObject: function(obj) {
		return Object.prototype.toString.call(obj) === '[object Object]';
	},

	isBoolean: function(tag) {
		return Object.prototype.toString.call(tag) === '[object Boolean]';
	},

	extend: function(obj) {
		var len = arguments.length;
		var isUpdate = arguments[len - 1];
		var obj = arguments[0];
		var target;

		isUpdate = this.isBoolean(isUpdate) ? isUpdate : true;
		for (var i = 1; i < arguments.length; i++) {
			target = arguments[i];
			if (!this.isPlainObject(target) || !this.isPlainObject(obj)){
				return i > 1 ? obj : {};
			}

			for (var key in target) {
				if (obj.hasOwnProperty(key) && !isUpdate) {
					continue;
				}
				obj[key] = target[key];
			}
		}

		return obj;
	},
	makeUID: function() {
		return (+new Date() + Math.floor(Math.random() * 999999)).toString(36);
	}
};

module.exports = Utils;