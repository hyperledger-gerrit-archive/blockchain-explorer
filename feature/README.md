# Setup

## For Linux (Ubuntu)

### Pull fabric images

```
$ cd /some/where/fabric-samples
$ ./scripts/bootstrap.sh
```

### Build Explorer / Explorer-DB image

```
$ cd /some/where/blockchain-explorer
$ ./build_docker_image.sh
```

### Install python & pip

```
$ apt-get install python python-pip
```

### Setup virtualenv

```
$ apt-get install virtualenv
$ cd /some/where/blockchain-explorer/feature
$ virtualenv e2e-test
$ source e2e-test/bin/activate
(e2e-test) $ 
```

### Install required packages

```
# At /some/where/blockchain-explorer/feature on virtual env 
(e2e-test) $ pip install -r requirement.txt
```

# Run test scenarios

```
# At /some/where/blockchain-explorer/feature on virtual env 
(e2e-test) $ behave ./explorer.feature
```

# Tips

* To enable stdout while running scenarios
  ```
  (e2e-test) $ behave --no-capture ./explorer.feature
  ```

# Link

* https://behave.readthedocs.io/en/latest/index.html
* https://github.com/hyperledger/fabric-test/tree/release-1.4/feature
  The Explorer e2e test environment is based on the fabric-test env
* https://github.com/stanfy/behave-rest
  This package is used to test REST API call in the BDD