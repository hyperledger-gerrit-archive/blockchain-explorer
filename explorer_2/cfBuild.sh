#!/bin/bash
# ------- Set these ENV vars
# ZONE - ex "dev"
# REGION - ex "us_south"
# DB_CONNECTION_STRING - 
# RUN_MODE ex "IBM-BCS"

set -e
export APP=passenger

export CFDOMAIN=mybluemix.net
if [ "$ZONE" != "prod" ]; then
  echo "Not in production. Using stage1.mybluemix.net as domain name."
  export CFDOMAIN=stage1.mybluemix.net
fi

if [ "$CF_TARGET_URL" == "https://api.eu-gb.bluemix.net" ]; then
  echo "Targeting Europe, using eu-gb.mybluemix.net as domain name."
  export CFDOMAIN=eu-gb.mybluemix.net
elif [ "$CF_TARGET_URL" == "https://api.au-syd.bluemix.net" ]; then
  echo "Targeting Australia, using au-syd.mybluemix.net as domain name."
  export CFDOMAIN=au-syd.mybluemix.net
fi

export GREEN=${CF_APP}-temp
export BLUE=${CF_APP}

echo "Blue is $BLUE, Green is $GREEN"

echo "Deleting past Green"
cf delete -f $GREEN || true

echo "Starting green..."
cf push --no-start -n $GREEN $GREEN
cf set-env $GREEN DB_CONNECTION_STRING $DB_CONNECTION_STRING
cf set-env $GREEN HOSTNAME $CF_APP.$CFDOMAIN
cf set-env $GREEN ZONE $ZONE
cf set-env $GREEN REGION $REGION
cf set-env $GREEN RUN_MODE $RUN_MODE
cf set-env $GREEN DB_PREFIX $DB_PREFIX
cf set-env $GREEN COMMIT $(git rev-parse --short HEAD)

cf unbind-service $BLUE drain-$ZONE-$APP || true
cf delete-service -f drain-$ZONE-$APP || true
cf cups drain-$ZONE-$APP -l https://elk.blockchain.ibm.com/$ZONE-$APP
cf bind-service $GREEN drain-$ZONE-$APP

if [ "$ZONE" == "prod" ]; then
  echo "Production zone: 3 instances at 1GB a piece."
  cf scale $GREEN -f -i 3 -m 1GB
elif [ "$ZONE" == "staging" ]; then
  echo "Staging zone: 2 instances at 256MB a piece."
  cf scale $GREEN -f -i 2 -m 256MB
else
  echo "Dev zone: 1 instances at 128MB a piece."
  cf scale $GREEN -f -i 1 -m 128MB
fi

cf start $GREEN

sleep 10

echo "Green $GREEN is up and running. Map the host to it."
cf map-route $GREEN $CFDOMAIN -n $BLUE

echo "Now unmap the previous version from the blue route..."
cf unmap-route $BLUE $CFDOMAIN -n $BLUE || true

echo "And clean up Greens old route."
cf delete-route -f $CFDOMAIN -n $GREEN || true

echo "And delete the previous version..."
cf delete -f $BLUE || true

echo "And green $GREEN becomes blue $BLUE..."
cf rename $GREEN $BLUE
