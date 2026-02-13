# Monolith API Odin

MS-API is the global, external and public Restful API for using Odin. The Odin's front-end application is connecting to this API.

# Security and Quality Gate
[![Quality Gate Status](https://sq.bb.peheux.fr/api/project_badges/measure?project=MS-API-ODIN&metric=alert_status&token=sqb_07a93cde0e2115b24b0b505f369d482d43574922)](https://sq.bb.peheux.fr/dashboard?id=MS-API-ODIN)
[![Coverage](https://sq.bb.peheux.fr/api/project_badges/measure?project=MS-API-ODIN&metric=coverage&token=sqb_07a93cde0e2115b24b0b505f369d482d43574922)](https://sq.bb.peheux.fr/dashboard?id=MS-API-ODIN)
[![Duplicated Lines (%)](https://sq.bb.peheux.fr/api/project_badges/measure?project=MS-API-ODIN&metric=duplicated_lines_density&token=sqb_07a93cde0e2115b24b0b505f369d482d43574922)](https://sq.bb.peheux.fr/dashboard?id=MS-API-ODIN)
[![Lines of Code](https://sq.bb.peheux.fr/api/project_badges/measure?project=MS-API-ODIN&metric=ncloc&token=sqb_07a93cde0e2115b24b0b505f369d482d43574922)](https://sq.bb.peheux.fr/dashboard?id=MS-API-ODIN)
[![Security Hotspots](https://sq.bb.peheux.fr/api/project_badges/measure?project=MS-API-ODIN&metric=security_hotspots&token=sqb_07a93cde0e2115b24b0b505f369d482d43574922)](https://sq.bb.peheux.fr/dashboard?id=MS-API-ODIN)
[![Reliability Issues](https://sq.bb.peheux.fr/api/project_badges/measure?project=MS-API-ODIN&metric=software_quality_reliability_issues&token=sqb_07a93cde0e2115b24b0b505f369d482d43574922)](https://sq.bb.peheux.fr/dashboard?id=MS-API-ODIN)
[![Maintainability Issues](https://sq.bb.peheux.fr/api/project_badges/measure?project=MS-API-ODIN&metric=software_quality_maintainability_issues&token=sqb_07a93cde0e2115b24b0b505f369d482d43574922)](https://sq.bb.peheux.fr/dashboard?id=MS-API-ODIN)
[![Security Issues](https://sq.bb.peheux.fr/api/project_badges/measure?project=MS-API-ODIN&metric=software_quality_security_issues&token=sqb_07a93cde0e2115b24b0b505f369d482d43574922)](https://sq.bb.peheux.fr/dashboard?id=MS-API-ODIN)
[![Maintainability Rating](https://sq.bb.peheux.fr/api/project_badges/measure?project=MS-API-ODIN&metric=software_quality_maintainability_rating&token=sqb_07a93cde0e2115b24b0b505f369d482d43574922)](https://sq.bb.peheux.fr/dashboard?id=MS-API-ODIN)
[![Reliability Rating](https://sq.bb.peheux.fr/api/project_badges/measure?project=MS-API-ODIN&metric=software_quality_reliability_rating&token=sqb_07a93cde0e2115b24b0b505f369d482d43574922)](https://sq.bb.peheux.fr/dashboard?id=MS-API-ODIN)
[![Security Rating](https://sq.bb.peheux.fr/api/project_badges/measure?project=MS-API-ODIN&metric=software_quality_security_rating&token=sqb_07a93cde0e2115b24b0b505f369d482d43574922)](https://sq.bb.peheux.fr/dashboard?id=MS-API-ODIN)
[![Technical Debt](https://sq.bb.peheux.fr/api/project_badges/measure?project=MS-API-ODIN&metric=software_quality_maintainability_remediation_effort&token=sqb_07a93cde0e2115b24b0b505f369d482d43574922)](https://sq.bb.peheux.fr/dashboard?id=MS-API-ODIN)

## How to run quality tests

Only for launching tests :
```js
npm run test
```

If you want to get **coverage** and send it to Sonarqube, here it :
```js
npm run test:coverage
sonar-scanner 
```

## Technical Documentation with Swagger

Right here : (https://api.crrs.cloud/doc)

## Launch the project

To launch the local development script, you need to :
- complete the dotenv **.env.local** your specific parameters ;
- then, run `npm run local`

### Others local service needed

You may need to deploy your database psql image (from [Caelus](https://gitlab.com/caelus-team/generics-tools/database)).

> Optional others : MS-DEPLOYMENT.

# Modules


### Plasma environment

In a Plasma environment (multicloud), one MS-API can managed multiple MS-Deployment, each one of those deployed in different Kubernetes cluster.

## Sequelize

All the builders in **./src/builders** are using Sequelize as ORM in order to communicate with Caelus and Cirrus PostgreSQL. They are all converted as JavaScript Object **./src/objects**.

We created the `public_format()` method in each object in order to get a format that can be sended to our external client without security issue.

# Deployment

All the deployment part is done and managed by ArgoCD.

## Env variables

### Application
- **APP_ADRESS** : the current application adress.
- **APP_PORT** : the port used by nodejs to get all the requests.
- **ENVIRONMENT** : used for selecting the right dotenv file. If `local`, mtls is disabled on communications with MS-Deployment. Else mtls is enabled.
- **EXPIRATION_HOURS** : how many hours before expiration of application (automatic shutdown by MS-Scheduling) - default `6`
- **TZ** : timezone, (Default on `Europe/Paris`)

### Database parameters
- **DB_DIALECT** : `postgres`.
- **DB_HOST** : the url to join the database.
- **DB_NAME** : the cirrus database name.
- **DB_PASSWORD** : password of the database.
- **DB_PORT** : the port used by the database.
- **DB_USER** : username of the database.
### JWT / Security
- **JWT_KEYPASS** : JWT token keypass to crypt/decrypt the id of users.
- **DURATION_TOKEN** : Duration before expiration of token.
### MS-Deployment
- **MS_DEPLOYMENT_ACTIVATED** : `True` / `False` if the API must connect to MS-Deployment or not.
- **MTLS_MS_DEPLOYMENT_PORT** : MTLS port to access to distant MS-DEPLOYMENT from master cluster. (`31002`)
- **UNSAFE_MS_DEPLOYMENT_ADRESS** : when `ENV` is on `local`, then we use unsafe ms_deployment. Typical use on local. (`localhost`)
- **UNSAFE_MS_DEPLOYMENT_METHOD** : when `ENV` is on `local`, then we use unsafe ms_deployment. Typical use on local. (`http`)
- **UNSAFE_MS_DEPLOYMENT_PORT** : when `ENV` is on `local`, then we use unsafe ms_deployment. Typical use on local. (`10002`)
### Swagger
- **SWAGGER_URL** : the url of swagger documentation.
- **SWAGGER_METHOD** : http / https for swagger.
### Storage export
#### Smash (only available option as now)
- **SMASH_STORAGE_CARRIER_IMAGE** : the image of the carrier.
- **SMASH_STORAGE_CARRIER_IMAGE_TAG** : the image tag of the carrier.
- **SMASH_STORAGE_CARRIER_API_KEY** : the Smash api key.
- **SMASH_STORAGE_CARRIER_REGION** : the Smash export region.
- **SMASH_STORAGE_CARRIER_TEAMID** : the Smash team id for custom export url.
### URLs
- **PUBLIC_URL** : public url of this API
- **FRONT_END_URL** : url of front-end. 
- **APPS_CRRS_URL** : url of crrs application (the internal ingress)