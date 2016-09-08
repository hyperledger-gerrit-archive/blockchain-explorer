# Controlling the Environment

When we refer to environment here, we mean the zone (dev/staging/production) in combination with the region (us-south, eu-gb, au-syd).

Currently, we run *five* service brokers:
- Dev
- Staging
- Production US South
- Production Europe
- Production Australia

Their configuration can come from three separate sources:
- Environment Variables
- The `statics` object
- Config Database

In the end, however, they end up in an object that is passed around called `ev`.

Why are there so many differences?  Consider, for example, that there is an authentication endpoint for staging Bluemix and a separate one for production Bluemix.  Users are not necessarily shared between them, and my organzation ID in production is not equal to my organization ID in staging!

## Environment Variables

- `ZONE`: One of `local, `dev`, `staging`, or `prod`.  Dictates the selections from the statics object and many other behaviors depending on which zone this broker is located in.
- `DB_CONNECTION_STRING`: The HTTPS+Basic Auth-enabled URL to the dedicated Cloudant instance that contains the database for this instance of the broker. **NOTE**: `dev` and `local` share the same database.  Production instances share the same database regardless of their region. 
- `ENFORCE_BACKEND_SSL`: Whether or not to require a valid SSL certificate when connecting to backend HTTPS APIs from the broker.
- `COMMIT`: The hash of this git commit for the service broker; useful for determining what code is actually running where.  This is set by the build script at deploy time.
- `REGION`: One of `us_south`, `eu_gb`, `au_syd`. Dictates the selection from the statics object as well as other behaviors depending on which region the broker is located in.
- `RUN_MODE`: Which mode to run in. 'IBM-BCS' or 'YETI'

## Statics Object

- `AUTH_URL`: The Multi Cloud Controller Proxy (MCCP) URL for this instance of the broker. The MCCP acts as a passthrough to the closest Cloud Controller, which is then used to authenticate this user.  Example: `https://mccp.ng.bluemix.net`.
- `SP_URL`: The Service Provider API URL for this instance of the broker.  The service provider API allows us to associate organization IDs with email addresses and tell who belongs to which org.  Example: `https://serviceprovider.ng.bluemix.net`.
- `CONTENT_URL`: The base path to the service broker, used for linking to static content as well as redirects. Example: `https://obc-service-broker-dev.mybluemix.net`.
- `DB_PREFIX`: Each zone has a set of databases in Cloudant that start with this prefix. Example: `dev_`.  This will allow us to look up networks in `dev_networks`, for example.
- `SERVICE_UUID`: The UUID for this service type.  This is the same across staging and production for all regions, but needs to be different in dev and local for metering/usage purposes. 
- `X86_UUID`: The UUID for this x86 service plan.  This is the same across staging and production for all regions, but needs to be different in dev and local for metering/usage purposes.
- `Z_UUID`: The UUID for this System Z service plan.  This is the same across staging and production for all regions, but needs to be different in dev and local for metering/usage purposes.

## Config Database

- `ADMIN_PASSWORD`: The password required for the HTTP REST APIs for provisioning/deprovisioning instances used by Cloud Foundry (Bluemix) and also admins when they are testing. Example: `password`.
- `AUTH_CLIENT_SECRET`: Each service type has a secret that allows it to authenticate with the Bluemix OAuth service to authorize users.
- `ADMIN_LIST`: A list of Bluemix email addresses that are allowed to access the admin console for the service broker.  Example: `["benjsmi@us.ibm.com", "mrshah@us.ibm.com"]`.
- `ES_ADMIN_USER`: The admin user for the elastic search datastore.  The broker uses this to create new elastic search users in the ELK stack so they can monitor the logs of their peers.
- `ES_ADMIN_PASS`: The admin password for the elastic search datastore.
- `ELK_VIEW_ID`: A UUID that allows quick linking to a particular view within Kibana that shows a user-friendly version of this user's peer logs.
