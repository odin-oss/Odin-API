# OSS era

# 2.0.1

- Added `School` and `Class` so we can identify users easily.
- Added `Agent` and `Enum_agent_type` so the Datacenter will be the provider of resource for environments.
- Added new route for adding a new Agent.
- Added new route for adding an available agent into an existing Datacenter.
- Added whitelist table in database to keep trace of authorized token.


# 2.0.0

- No more seperated database, only one common base.

# MVP era

# 1.1.3 (December 2025)

- Added new route `/user/create` for admin in order to create new user account from api.

# 1.1.2 (December 2025)

- Added implementation of icon and display_name on user's interfaces.

# 1.1.1 (November 2025)

- Added automatic download of application content before deletion.
- Added validation to ensure applications are shutdown before export operations.
- Enhanced storage service with download-before-deletion functionality.
- Added comprehensive unit tests for new storage features.

# 1.1.0-PATCH (October 2025)

- DELETE /application is not deleting application from db anymore and just setting 'Deleted' state.

# 1.1.0 (October 2025)

- EXPIRATION_HOURS added time of application expiration directly in the process.env.

# 1.0.9 (September 2025)

- Added history records add on app access.
- Added History with last_record by owner on application/list GET and application/ GET.
- Now managing time and date following utc for better time compatibility.
- Decommission of application creation directly to MS-DEPLOYMENT, that is now a functionality reserved to MS-SCHEDULING (standalone/master)

# 1.0.8 (September 2025)

- Added /session POST for session creation.
- Added /session/list GET for session listing - depending on role.
- Added /session/ GET for session querying - depending on role.
- Added /user/list_by_role GET for getting list of users by role - admin only.
- Update token.isOwner so Admin can also do actions even if not owners.

# 1.0.7 (July 2025)

- Added implementation of Datacenter on all application route.
- Now you need to give datacenter to deploy applications through MS-Deployment.

# 1.0.6 (May 2025)

- Added Icon on environment and application

# 1.0.5 (Avril 2025)

- 99% of unit tests coverage and cleaned some OIDC leftovers

# 1.0.4 (Avril 2025)

- Added compatibility of RAM / CPU / GPU in interface object.

# 1.0.3 (Avril 2025)

- Added support of `port_type` with ingress controller configurations selection.

# 1.0.2 (Avril 2025)

### Application

- Changed url on public_format for new one : /hash/interface_label
- Adapted variable for MS-Deployment new standard.

# 1.0.1 (March 2025)

### Application

- Added key props on application.get() to filter on generated_label.
- Send state of application is all public_format.

### Category

- Added google_material_icon.

### User

- PUT /password : Change passsword of current user.

## 1.0.0 (March 2025)

### Application

- GET /application/list : Get all the applications of the current user.
- PUT /application/stop : Stop an application.
- PUT /application/start : Start an application.
- POST /application : Create a new application.
- DELETE /application : Delete an application.
- GET /application : Get all the application's infos.

### Authentication

- GET /auth/app : Does the user have the access to the app ?
- GET /auth/options : Get all the different options of connexion.
- POST /auth/connect_by_credentials : Connect to Odin by using the credentials way.

### Base

- GET / : Base route to test if Odin is working.
- GET /metrics : Application's metrics for Prometheus.

### Category

- GET /category/list : Get the list of all categories and their respective environments.

### Environment

- GET /environment/list : Get all environments available.

### User

- GET /user/me : Get informations about yourself.
