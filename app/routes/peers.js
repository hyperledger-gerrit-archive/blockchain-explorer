
function getPeers(req, res) {
    console.log('getPeers');
    let data = require('../../mock_server/mockData/peerList.json')
    res.send(data);
};

module.exports = { getPeers };