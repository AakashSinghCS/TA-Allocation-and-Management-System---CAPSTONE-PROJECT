## Getting the Docker Container Started
1. Make sure you have docker installed on your computer
2. Navigate to the root folder
3. Fill out .env files if they exist.
4. Run `docker compose up --build` in the terminal. You don't need `--build` afterwards.
5. To access the container shell,  run `docker exec -it <container-name> sh`. Container name for the frontend is `frontend`.
6. When the container is running, website should be exposed at http://localhost:5173
7. If you want to use a containerized backend, use the combined yaml file using command `docker compose -f compose.combined.yaml up`, default compose only uses the frontend and MySQL containers. For this to work, you will need the newest maven and jdk versions so it can copy those files for the container. Instructions are under the spring boot section below.

More information on using Docker and the general files for setup can be found [here](https://docs.docker.com/manuals/)
## Docker instructions/tips
 - when installing a new library using npm install, enter the container shell, and then run npm install `<name of library>`
 - you will probably see a red underline when using the the new package that you installed. Outside of the shell, on your local terminal, after cd-ing to app/TA-portal-infinity, run npm install. Then the local node_modules will be updated too, and the red underline will disappear.
 - If you think frontend container is still not running because of node_modules, try running this: `rm -rf node_modules package-lock.json`,`docker compose down -v`, ` docker compose build --no-cache `, `docker compose up` that removes any old node_modules locally and on the docker and rebuilds it. Replace `docker compose up` with `docker compose -f compose.combined.yaml up` to have a containerized backend.


## Vitest
1. for testing, run `npm run test` after entering the docker container shell. Run `npm run test:watch` when modifying files as you test.
2. For coverage, run `npm run test -- --coverage` and you will see the coverage, index.html file, in my-custom-coverage folder.

[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg)](https://classroom.github.com/online_ide?assignment_repo_id=19555150&assignment_repo_type=AssignmentRepo)
  

# Spring Boot
You can find documentation for the framework [here](https://docs.spring.io/spring-boot/index.html).

## Setup

The database connection for MySQL comes from the docker container - this is specified in the normal docker compose file that has the frontend and database, as well as the combined yaml. You will need the MySQL container running for the applications to run.

Since there's no hot reloading with the docker containers, it makes more sense when we are developing the backend to just have the DB and frontend running
in the containers, and run the backend as needed. If you are using VSCode, you can download the Spring Boot extension pack which gives a dashboard to easily start and stop the different services.

 This can restart the application faster to see changes than needing to rebuild the container every time in docker when we change something. We can still use it as a container when deploying, or if you'd really rather wait for the container to build each time you make a change.

For this to work, make sure you have open [jdk 24](https://jdk.java.net/24/) in your path system environment variables (or through a package manager) and in your Vscode JDK path, and [Maven 3.9.9](https://maven.apache.org/download.cgi) also in your path or through a package manager.

When the programs are running, the application properties should default to dev unless started as a container, which will then use the docker properties and adjust the url to connect to the running MySQL container appropriately.

## Configuration

The two current services User Service and Course Service connect to their databases using [Spring JPA](https://spring.io/projects/spring-data-jpa), which are initialized at first with the [init/init.sql](./init/init.sql) file which creates them first and grants privileges to dev_user. If you need more databases, add them to this file and rebuild the MySQL container.

In the application.properties for the services, the database is set to `create-drop` which will recreate the database on restart of application. You can change this to `update` to persist the data between sessions, but will need to use `create-drop` if you change parameters at some point. You can also use command line runner interface to put in data consistently on application start with `create-drop` if you want.

The [API Gateway](https://spring.io/projects/spring-cloud-gateway) is running on port 8080, and the routes for the various endpoints are configured in the application properties files, so you can add more as you implement new services. 

The service registry microservice is running the [Eureka](https://cloud.spring.io/spring-cloud-netflix/reference/html/) server, and all other services have the Eureka client. This means that the Eureka server is connected to all of the subscribed Eureka clients. This allows the API Gateway to redirect as needed, and down the line can provide load balancing and other features.

Inter service communication is done using [OpenFeign](https://spring.io/projects/spring-cloud-openfeign), and allows the use of interfaces to call methods in another microservice.

The notification service uses SMTP through the Java Mailer library. Right now it's configured to localhost and also if the environment is dev or docker then it also only logs it to the console. Would need to comment that out, or run in prod env, and also configure an smtp service in the application.properties.

## Tests

Testing is done using [JUnit](https://junit.org/junit5/) and [Mockito](https://site.mockito.org/) is a nice library for mocking database and object calls for our unit testing, and coverage is run with [Jacoco](https://www.eclemma.org/jacoco/). Go to the service you are trying to get coverage for and run `mvn test jacoco:report`. You can run individual unit tests through the java test runner extension, but that won't give coverage. Once the tests pass there, you can then run the Jacoco command to get coverage. If you install the Coverage Gutters extension and set it so `watch` and `show coverage` in the command pallette you can then see which lines are covered and which aren't. Jacoco also creates an html if you just want to see it there found in `target/site/jacoco/index.html`.

Eventually, we can use `@SpringBootTest` for integration tests with an in-memory H2 database that can start for the tests and destroy itself after. Test service logic and utilities with Junit and Mockito, and test controllers with HTTP mappings with `@WebMvcTest` and MockMvc.

## Auth

Authentication is done using JWT's through the [jjwt](https://github.com/jwtk/jjwt) library to manage them. At the moment, the gateway service has a filter that checks if the JWT is valid before allowing any routes through, except for auth. On login in the user service, a JWT is created with the users email as the subject, and with claims of their role and id. The gateway when it parses this JWT extracts these and puts them into the headers to be forwarded downstream, which means that if the token is valid you'll know their privileges and id to do functions.

You can comment out the expiration time if you want a token for postman calls which are used currently in the tools section for postman, since it means that in the postman calls the JWT used for authentication would need to be changed constantly. This also means that if a user has their account deleted, they can still access the system if they have their old JWT. What this means is that in general for sensitive operations we should make sure the user is available, and once more of the core functionalities of the system are working, it would be good to re-introduce the time expiry for JWT's as well as using refresh tokens to account for users being deleted from the system.

The secret key for the JWT is stored in the application properties of both the gateway and the user service. It is generic and not secure. For production, you would need to change this, maybe dynamically generated. The issue is since they are in separate services, you can't generate and use it in code - maybe need a .env file that is hidden and stores it for both services, and is updated regularly.

Each service will need spring security with JWT auth filter to handle granted authorities from the headers, and the method security provides the use of annotations to specify which role can do what function. Finally the security config just specifies that the JWT filter has to provide auth for anything to work in that service.


