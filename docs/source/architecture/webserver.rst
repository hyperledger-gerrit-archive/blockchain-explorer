
.. SPDX-License-Identifier: Apache-2.0




Webserver
==========

Node.js is the backend framework for implementing the server-side components, and Express Node.js framework is used for the web
application. The main entry point of the Hyperledger Explorer is
the `Broadcaster <https://github.com/hyperledger/blockchain-explorer/blob/master/main.js>`__ class, 
that will initialize the application, WebSockets, create a Express server, and other processes to start the application.

Broadcaster class diagram shown in the image below.

.. raw:: html
     :file: ./webserver.html


