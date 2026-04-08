# Monolith API Odin

MS-API is the global, external and public Restful API for using Odin. The Odin's front-end application is connecting to this API.

[![SonarQube Cloud](https://sonarcloud.io/images/project_badges/sonarcloud-highlight.svg)](https://sonarcloud.io/summary/new_code?id=odin-oss_Odin-API)

## 1. Prodding a new release

Here are the mandatory steps you need to validate before doing a PR to main branch :
- **Quality and Security** : You need your unit test coverage to raise at least 98% and running successfuly. You need also to resolve all the hotspots and issues identified by SonarQube. 
- **Update the Changelog** : It is very important for us to keep a track of all the new stuff coming with the new release.
- **Update Swagger routes** : The swagger interface is the entrypoint of any customer that is working with our API. So it really needs to be completed and fully updated.

When you have all of it, you can create a new pull request from your branch to the main branch.
From there, you will need an approval from the maintainers of the project [ask Benoit](mailto://benlef99@gmail.com).



## 2. Security and Quality Gate
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=odin-oss_Odin-API&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=odin-oss_Odin-API)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=odin-oss_Odin-API&metric=bugs)](https://sonarcloud.io/summary/new_code?id=odin-oss_Odin-API)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=odin-oss_Odin-API&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=odin-oss_Odin-API)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=odin-oss_Odin-API&metric=coverage)](https://sonarcloud.io/summary/new_code?id=odin-oss_Odin-API)
[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=odin-oss_Odin-API&metric=duplicated_lines_density)](https://sonarcloud.io/summary/new_code?id=odin-oss_Odin-API)

### a. How to run quality tests

Only for launching tests :
```js
npm run test
```

If you want to get **coverage** and send it to Sonarqube, here it :
```js
npm run test:coverage
sonar-scanner
```

### b. How to generate the technical documentation (with Swagger)

Right here : (https://api.crrs.cloud/doc)


## 3. Dependencies

The project is needing some external services to be properly working :
- **PSQL database** : it is the part where all the informations about Odin, its users, and applications are stored.
- **Kafka cluster** : we are using a kafka cluster as a message queue service. from and to where all the live processes are queuing (Application deployment, Storage exports, etc...)
- **Kong Ingress** : this is where all the user's interfaces are exposed. It comes with an API giving us the possibility to manage it directly.

To be deleted : 
- **Kubernetes cluster**: for the moment, the API needs a Kubernetes cluster in which it can deploy all the containers. Note that in a close future this part will be stored in a dedicated vault to give the API the ability to manage multiple *Datacenters*.

## 4. Launching the service localy (dev env)

If you want to contribute or just running this project on your computer / server, you will need to follow this how-to guide.

The complete guide for this part is available in our public documentation : [here you go](https://odin-oss.github.io/docs.odin.github.io/tutorials/1.how-to-set-up-my-development-environment/).

### Sequelize

All the builders in **./src/builders** are using Sequelize as ORM in order to communicate with Caelus and Cirrus PostgreSQL. They are all converted as JavaScript Object **./src/objects**.

We created the `public_format()` method in each object in order to get a format that can be sended to our external client without security issue.

## 5. Environment variable

This is the full list of all the variables you have to set either in *.env* file or in the container variables :

### a. Application
- `APP_ADDRESS` : the current application adress.
- `APP_PORT` : the port used by nodejs to get all the requests.
- `APP_ENVIRONMENT` : used for selecting the right dotenv file.
- `APP_MODE` : #TODO
- `APP_TZ` : timezone, (Default on `Europe/Paris`)
- `APP_TOKEN_KEYPASS` : #TODO
- `APP_TOKEN_KEYPASS` : how many hours before expiration of application (automatic shutdown by MS-Scheduling) - default `6`
- `USER_APPS_EXPIRATION_HOURS` : #TODO
- `USER_APPS_HOSTNAME` : #TODO
- `TLS_ODIN_DASHBOARD` : #TODO
- `TLS_ODIN_MONOLITH` : #TODO
- `MAX_CONTENT_SIZE` : #TODO
- `SWAGGER_URL` : #TODO
- `SWAGGER_METHOD` : #TODO

### b. PSQL database
- `DB_DIALECT` : `postgres`.
- `DB_HOST` : the url to join the database.
- `DB_NAME` : the cirrus database name.
- `DB_PASSWORD` : password of the database.
- `DB_PORT` : the port used by the database.
- `DB_USER` : username of the database.

### c. Kafka cluster
- `KAFKA_BROKER` : the port used by the database.
- `KAFKA_TOPIC` : username of the database.

### d. KONG ingress
- `APPS_INGRESS_ACTIVATED` : #TODO
- `APPS_INGRESS_URL` : #TODO


### e. Kubernetes (to be deprecated)
- `KUBERNETES_VOLUME_TYPE` : #TODO
- `KUBERNETES_STORAGE_CLASSNAME` : #TODO
- `KUBERNETES_ACTIVATED` : #TODO
- `KUBERNETES_URL` : #TODO
- `KUBERNETES_TOKEN` : #TODO
- `KUBERNETES_MASTER_IP` : #TODO
- `KUBERNETES_TOKEN_PATH` : #TODO
- `KUBERNETES_CA_CERT_PATH` : #TODO
- `KUBERNETES_ISTIO_ACTIVATED` : #TODO

### f. Smash storage
- `STORAGE_CARRIER_SENDER_EMAIL` : #TODO
- `STORAGE_CARRIER_SENDER_NAME` : #TODO
- `SMASH_STORAGE_CARRIER_IMAGE` : the image of the carrier.
- `SMASH_STORAGE_CARRIER_IMAGE_TAG` : the image tag of the carrier.
- `SMASH_STORAGE_CARRIER_API_KEY` : the Smash api key.
- `SMASH_STORAGE_CARRIER_REGION` : the Smash export region.
- `SMASH_STORAGE_CARRIER_TEAMID` : the Smash team id for custom export url.

### g. Containers private registry (to be deprecated)
- `REGISTRY_URL`: #TODO
- `REGISTRY_USERNAME`: #TODO
- `REGISTRY_PASSWORD`: #TODO