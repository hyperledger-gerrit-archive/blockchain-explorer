Feature: Bootstrapping Hyperledger Explorer
    As a user I want to be able to bootstrap Hyperledger Explorer

# @sanity
# @doNotDecompose
# Scenario: Bring up explorer with tls-disabled fabric network and retrieve channel list successfully
#     Given I have a bootstrapped fabric network of type solo without tls
#     Given the NETWORK_PROFILE environment variable is solo-disabled
#     When an admin sets up a channel named "mychannel"
#     When I start explorer
#     Then the logs on explorer.mynetwork.com contains "Synchronizer pid is " within 10 seconds

#     Given I wait "5" seconds
#     Given I set base URL to "http://localhost:8090"
#     When I make a POST request to "auth/login" with parameters
#     |user  |password   |network        |
#     |test  |test       |first-network  |
#     Then the response status code should equal 200
#     Then the response structure should equal "loginResp"
#     Then JSON at path ".success" should equal true
#     Then JSON at path ".user.message" should equal "logged in"
#     Then JSON at path ".user.name" should equal "test"

#     Given JSON at path ".success" should equal true
#     Given I want to reuse "token" parameter
#     Given I set Authorization header to "context.token"
#     When I make a GET request to "api/channels"
#     Then the response status code should equal 200
#     Then the response structure should equal "channelsResp"
#     Then JSON at path ".channels" should equal ["mychannel"]

@basic
# @doNotDecompose
Scenario Outline: [<network-type>] Bring up explorer with fabric-samples/<network-type> and retrieve channel list successfully
    Given I start <network-type>
    Given the NETWORK_PROFILE environment variable is <network-type>
    When I start explorer
    Then the logs on explorer.mynetwork.com contains "Synchronizer pid is " within 10 seconds

    Given I wait "5" seconds
    Given I set base URL to "http://localhost:8090"
    When I make a GET request to "auth/networklist"
    Then the response status code should equal 200
    Then the response structure should equal "networklistResp"
    Then JSON at path ".networkList" should equal [[ "<network-type>", {} ]]

    When I make a POST request to "auth/login" with parameters
    |user  |password   |network        |
    |test  |test       |<network-type> |
    Then the response status code should equal 200
    Then the response structure should equal "loginResp"
    Then JSON at path ".success" should equal true
    Then JSON at path ".user.message" should equal "logged in"
    Then JSON at path ".user.name" should equal "test"

    Given JSON at path ".success" should equal true
    Given I want to reuse "token" parameter
    Given I set Authorization header to "context.token"
    When I make a GET request to "api/channels"
    Then the response status code should equal 200
    Then the response structure should equal "channelsResp"
    Then JSON at path ".channels" should equal ["mychannel"]

    When I make a GET request to "api/channels/info"
    Then the response status code should equal 200
    Then the response structure should equal "channelsInfoResp"
    Then JSON at path ".status" should equal 200
    Then JSON at path ".channels[0].channelname" should equal "mychannel"

    Given I want to reuse parameter "channel_genesis_hash" at path "channels[0].channel_genesis_hash"
    Given I want to reuse parameter "block_height" at path "channels[0].blocks"

    When I make a GET request to the following path segment
    # api/block/<context.channel_genesis_hash>/<context.block_height - 1>
    |path                           |
    |api                            |
    |block                          |
    |context.channel_genesis_hash   |
    |context.block_height           |
    Then the response status code should equal 200
    Then the response structure should equal "blockResp"
    Then JSON at path ".status" should equal 200

    When I make a GET request to "api/peersStatus/mychannel"
    Then the response status code should equal 200
    Then the response structure should equal "peersStatusResp"
    Then JSON at path ".status" should equal 200

    When I make a GET request to the following path segment
    # api/blockActivity/<context.channel_genesis_hash>
    |path                           |
    |api                            |
    |blockActivity                  |
    |context.channel_genesis_hash   |
    Then the response status code should equal 200
    Then the response structure should equal "blockactivityResp"
    Then JSON at path ".status" should equal 200
    Then JSON at path ".row[0].channelname" should equal "mychannel"

    Examples:
    |network-type     |
    |first-network    |
    |balance-transfer |

@basic
# @doNotDecompose
Scenario: [balance-transfer] Register a new user and enroll successfully
    Given I start balance-transfer
    Given the NETWORK_PROFILE environment variable is balance-transfer
    When I start explorer
    Then the logs on explorer.mynetwork.com contains "Synchronizer pid is " within 10 seconds

    Given I wait "5" seconds
    Given I set base URL to "http://localhost:8090"

    When I make a POST request to "auth/register" with parameters
    |user  |password   |affiliation |role   |
    |test  |test       |department1 |admin  |
    Then the response status code should equal 200
    Then the response structure should equal "registerResp"
    Then the response parameter "status" should equal 200

    # duplicate call : auth/register (fail)
    When I make a POST request to "auth/register" with parameters
    |user  |password   |affiliation |role   |
    |test  |test       |department1 |admin  |
    Then the response status code should equal 200
    Then the response structure should equal "registerResp"
    Then the response parameter "status" should equal 400
    Then the response parameter "message" should equal "Failed to get registered user: test with error: Error: Failed to register : Already exist, test"

    When I make a POST request to "auth/enroll" with parameters
    |user  |password   |affiliation |role   |
    |test  |test       |department1 |admin  |
    Then the response status code should equal 200
    Then the response structure should equal "enrollResp"
    Then the response parameter "status" should equal 200

    # duplicate call : auth/enroll (succeed)
    When I make a POST request to "auth/enroll" with parameters
    |user  |password   |affiliation |role   |
    |test  |test       |department1 |admin  |
    Then the response status code should equal 200
    Then the response structure should equal "enrollResp"
    Then the response parameter "status" should equal 200

@basic
# @doNotDecompose
Scenario: [first-network] Not supported to register a new user and enroll
    Given I start first-network
    Given the NETWORK_PROFILE environment variable is first-network
    When I start explorer
    Then the logs on explorer.mynetwork.com contains "Synchronizer pid is " within 10 seconds

    Given I wait "5" seconds
    Given I set base URL to "http://localhost:8090"

    When I make a POST request to "auth/register" with parameters
    |user  |password   |affiliation |role   |
    |test  |test       |department1 |admin  |
    Then the response status code should equal 200
    Then the response structure should equal "registerResp"
    Then the response parameter "status" should equal 400
    Then the response parameter "message" should equal "Failed to get registered user: test with error: Error: Not supported user registration without CA"

    When I make a POST request to "auth/enroll" with parameters
    |user  |password   |affiliation |role   |
    |test  |test       |department1 |admin  |
    Then the response status code should equal 200
    Then the response structure should equal "enrollResp"
    Then the response parameter "status" should equal 400
    # TODO need to fix this error message 'TypeError: Parameter \"url\" must be a string, not undefined'
    # Then the response parameter "message" should equal "Failed to get registered user: test with error: Error: Not supported user registration without CA"
