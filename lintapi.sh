rm -f ./openapi.json*
wget http://localhost:3000/docs/api/openapi.json
lint-openapi ./openapi.json -c ./ibm-openapi.yml