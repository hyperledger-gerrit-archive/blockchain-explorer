Feature: Bootstrapping Hyperledger Explorer
    As a user I want to be able to bootstrap Hyperledger Explorer

@sanity
@doNotDecompose
Scenario: Bring up explorer with tls-disabled fabric network and retrieve channel list successfully
    Given I have a bootstrapped fabric network of type solo without tls
    When an admin sets up a channel named "mychannel"
    When I start explorer
    Then the logs on explorer.mynetwork.com contains "Synchronizer pid is " within 10 seconds

    Given I wait "5" seconds
    Given I set base URL to "http://localhost:8090"
    When I make a POST request to "auth/login" with parameters
    |user  |password   |network        |
    |test  |test       |first-network  |
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
