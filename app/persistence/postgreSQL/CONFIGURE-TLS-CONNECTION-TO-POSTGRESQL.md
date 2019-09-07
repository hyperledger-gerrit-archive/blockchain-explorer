
<!-- (SPDX-License-Identifier: CC-BY-4.0) -->  <!-- Ensure there is a newline before, and after, this line -->

# TLS connection to Postgresql

In order to configure TLS connection to Postgresql take next steps:

<<<<<<< HEAD   (2ad8b2 Merge "Add CODEOWNERS")
- [Optional] pass environment variable `DATABASE_CERTS_PATH`, default is `/opt/explorer/db-certs` 

- put certificates into folder specified by `DATABASE_CERTS_PATH`. There should be three files:

    - `client-cert.pem`
    - `client-key.pem`
    - `server-ca.pem`
    
=======
- [Optional] pass environment variable `DATABASE_CERTS_PATH`, default is `/opt/explorer/db-certs`

- put certificates into folder specified by `DATABASE_CERTS_PATH`. There should be three files:

    - `client-cert.pem`
    - `client-key.pem`
    - `server-ca.pem`

>>>>>>> BRANCH (e2d278 BE-690 Switch orderer when losing connection)
- pass environment variable `DATABASE_SSL_ENABLED=true`
