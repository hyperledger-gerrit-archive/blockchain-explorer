var expect = require('chai').expect;
var assert = require('assert');
var helper = require('../helper');
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../../mock_server/server');
let should = chai.should();
chai.use(chaiHttp);

describe('getLogger()', function () {
    it('should getLogger()', function () {
        // 1. arrange
        var dir = '.';
        //2. act
        var logger = helper.getLogger();
        // 3 assert
        assert.notEqual(null, logger);

    })
})

/*
  * Test the /status route
  */
describe('/GET /api/status', () => {
    it('it should GET all badge counters', (done) => {
        chai.request(server)
            .get('/api/status')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.have.property('chaincodeCount');
                res.body.should.have.property('txCount');
                res.body.should.have.property('latestBlock');
                res.body.should.have.property('peerCount');
                done();
            });
    });
});

/*** Test /api/channels'
 * // get url : http://localhost:8080/api/channels/host_name=example.org
 */
describe('/GET /api/channels', () => {
    it('it should GET lsit of channels by peer', (done) => {
        chai.request(server)
            .get('/api/channels/host_name=example.org')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.have.property('channels');
                done();
            });
    });
});
