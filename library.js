'use strict';

const db = require.main.require('./src/database');
const meta = require.main.require('./src/meta');
const socketRooms = require.main.require('./src/socket.io/admin/rooms');
const utils = require.main.require('./src/utils');

let app;
const Widget = {};

Widget.init = async function (params) {
	app = params.app;
};

Widget.defineWidgets = async function (widgets) {
	return widgets.concat([
		{
			widget: 'aa_stats',
			name: 'Ariastel: Stats',
			description: 'Displays a forum stats.',
			content: await app.renderAsync('admin/aa_stats', {}),
		}
	]);
}

Widget.renderStatsWidget = async function (widget) {

	const [global, onlineCount, guestCount] = await Promise.all([
		db.getObjectFields('global', ['postCount', 'userCount']),
		db.sortedSetCount('users:online', Date.now() - (meta.config.onlineCutoff * 60000), '+inf'),
		socketRooms.getTotalGuestCount(),
	]);

	const stats = {
		posts: utils.makeNumberHumanReadable(global.postCount ? global.postCount : 0),
		users: utils.makeNumberHumanReadable(global.userCount ? global.userCount : 0),
		online: utils.makeNumberHumanReadable(onlineCount + guestCount),
	};

	widget.html = await app.renderAsync('widgets/aa_stats', stats);
	return widget;
};


module.exports = Widget;