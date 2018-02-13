/****
 * Block information
Block by number

GET /api/block/getinfo -> /api/block/id=2
 */
function getBlockById(req, res) {
    let id = req.params.id
    console.log('getChannelsByPeer:', id);
    let data = require('../../mock_server/mockData/apiblockgetinfo.json')
    res.set('Content-Type', 'application/json');
    if (id) {
        res.send(data);
    } else {
        res.send({});
    }
};

module.exports = { getBlockById };

