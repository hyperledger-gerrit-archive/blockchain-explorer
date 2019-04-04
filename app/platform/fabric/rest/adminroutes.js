const User = require('./../models/User');

const { responder } = require('./../../../rest/requestutils');

const adminroutes = async function(router, platform) {
  const proxy = platform.getProxy();

  /** *
    Register
    POST /register -> /register
    curl -X POST -H 'Content-Type: application/json' -d '{ 'user': '<user>', 'password': '<password>', 'affiliation': '<affiliation>', 'roles': '<roles>' }' -i 'http://<host>:<port>/api/register'
    *
    */
  router.post(
    '/register',
    responder(async req => {
      //:user/:password/:affiliation/:roles
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
