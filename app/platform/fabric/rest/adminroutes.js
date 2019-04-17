/**
 *    SPDX-License-Identifier: Apache-2.0
 */

const User = require('./../models/User');

const { responder } = require('./../../../rest/requestutils');

const adminroutes = async function(router, platform) {
  const proxy = platform.getProxy();

  /** *
    Register
     curl 'http://<host>:<port>/api/register'  -H 'Accept: application/json'
     -H 'Authorization: bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.8iTytz6wkPMVJzgD3jIGTQ2s2UZLO8nzvJQJGR0rs_0'
     -H 'Content-Type: application/json'
     --data-binary '{ "user": "user@gmail.com", "password": "adminpw", "affiliation": "department1", "roles": "client" }' --compressed

     ** "affiliation": "department1" see fabric-ca server configuration, https://hyperledger-fabric-ca.readthedocs.io/en/latest/serverconfig.html
    *
    */
  router.post(
    '/register',
    responder(async req => {
      const reqUser = await new User(req.body).asJson();
      return await proxy.register(reqUser);
    })
  );

  /** *
    Enroll
    POST /enroll -> /enroll
    curl -X POST -H 'Content-Type: application/json' -d '{ 'user': '<user>', 'password': '<password>', 'affiliation': '<affiliation>', 'roles': '<roles>' }' -i 'http://<host>:<port>/api/enroll'
    *
    */
  router.post(
    '/enroll',
    responder(async req => {
      const reqUser = await new User(req.body).asJson();
      return await proxy.enroll(reqUser);
    })
  );
};

module.exports = adminroutes;
