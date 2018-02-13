/****Channel List
GET /channellist -> /api/channels/host_name=example.org
 */

function getChannels(req, res) {
    let host_name = req.params.host_name;
    console.log('getChannels, host_name:', req.params.host_name);
    let data = require('../../mock_server/mockData/channellist.json');
    res.set('Content-Type', 'application/json');
    res.send(data);
};

module.exports = { getChannels };