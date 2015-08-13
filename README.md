Console
=======

Console is an UI for Analytics PaaS. It has three main responsibilities:

 * static resources hosting (HTML, JS, etc.);
 * user authentication;
 * reverse proxy for services.

##Local Development

### Requirements
* Java 1.8
* Maven
* Ruby (tested on version 2.1.5)
* Compass (required to compile stylesheets) - to install type:
  ```
sudo gem install compass
```

### Running

The simplest way to run Console is to use spring-boot maven plugin:

```
mvn spring-boot:run
```
As described in [documentation](http://docs.spring.io/spring-boot/docs/1.2.0.RELEASE/maven-plugin/usage.html)
Spring-boot plugin appends [resources](src/main/resources) directory to the classpath. This allows for a very quick web development, because all the resources are hot-deployed.  

### Setting up dependencies
Console is only a reverse-proxy - it doesn't have application logic. To run and develop console locally, it's needed to configure the console to know where the dependencies are. There is no need to set up all dependent microservices at once. Most of the time developer works on 1-2 features and uses a few microservices only. 

Although, there is one project always required - [user-management](https://github.com/trustedanalytics/user-management) which is responsible for downloading user details, organizations list, etc. A whole list of dependencies is stored in [application.yml](src/main/resources/application.yml).

To run the service locally or in Cloud Foundry, the following environment variables need to be defined:
* `VCAP_SERVICES_SSO_CREDENTIALS_APIENDPOINT` - a Cloud Foundry API endpoint;
* `VCAP_SERVICES_SSO_CREDENTIALS_AUTHORIZATIONURI` - an OAuth authorization endpoint;
* `VCAP_SERVICES_SSO_CREDENTIALS_TOKENURI` - an OAuth token authorization endpoint;
* `VCAP_SERVICES_SSO_CREDENTIALS_CHECKTOKENURI` - an UAA endpoint for authorization token validation;
* `VCAP_SERVICES_SSO_CREDENTIALS_TOKENKEY` - an UAA endpoint for verifying token signatures;
* `VCAP_SERVICES_SSO_CREDENTIALS_CLIENTID` - a client ID used for OAuth authorization;
* `VCAP_SERVICES_SSO_CREDENTIALS_CLIENTSECRET` - a client secret used for OAuth authorization;

#### Binding to external microservices
It's the easiest way of setting up a local environment. The idea is to spin up the console only and connect it to microservices already running in an external environment. It can be done be using ``vcap.**`` property. For example if we want to connect to user-management service
deployed on CF we need to add an argument:

```
mvn spring-boot:run -Drun.arguments='--vcap.services.user-management.credentials.host=http://user-management.<platform-url>'
```

All the properties used for external services binding can be found in [application.yml](src/main/resources/application.yml) file. 

#### Binding to local microservices
An alternative to binding to external services is setting up dependent microservices on a local machine. Having them running locally there is no need to configure anything if they are running on proper ports. Such mappings of port - microservice can be found in [application.yml](src/main/resources/application.yml).
Instructions how to run particular microservices can be found in README of those projects.

### Developing web application
Although, console is a Java application, there is almost no Java logic in it - most of it is a reverse proxy and security configuration. The main content is the JavaScript code, which also requires compilation.

#### Running via Maven
Each Maven run causes recompiling of the web source files so the easiest (and longest way) is to run:
```
mvn spring-boot:run
```

#### Recompiling via Gulp
[Gulp](http://gulpjs.com/) is a NodeJS build system for web sites.

Requirements:
* NodeJS

After the first compilation via Maven it's possible to run from the console root directory, which will compile all of web sources and hot deploy them on the server.
```
./node_modules/gulp/bin/gulp.js
```

 It's also possible to install gulp globally:
```
npm install -g gulp
```

Since running whole build process takes some time, during development process it's handy to use `gulp watch` command which automatically recompiles proper part of the code after each file change.
```
$ gulp watch
[16:49:59] Using gulpfile ~/console/gulpfile.js
[16:49:59] Starting 'watch:app'...
[16:49:59] Finished 'watch:app' after 223 ms
[16:49:59] Starting 'watch:new-account'...
[16:49:59] Finished 'watch:new-account' after 12 ms
[16:49:59] Starting 'watch'...
[16:49:59] Finished 'watch' after 6.3 μs
[16:50:20] Starting 'scripts:app'...
[16:50:20] Finished 'scripts:app' after 454 ms

```
