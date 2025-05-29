## Getting the Docker Container Started
1. Make sure you have docker installed on your computer
2. Navigate to the main folder
3. Fill out .env files if they exist.
4. Run `docker compose up --build` in the terminal. You don't need `--build` afterwards.
5. To access the container shell,  run `docker exec -it <container-name> sh`. Container name for the frontend is `frontend`.
6. When the container is running, website should be exposed at http://localhost:5173
7. If you want to use a containerized backend, use the combined yaml file using command `docker compose -f compose.combined.yaml up`, default compose only uses the frontend and MySQL containers. For this to work, you will need the newest maven and jdk versions so it can copy those files for the container. Instructions are under the spring boot section below.

More information on using Docker and the general files for setup can be found [here](https://docs.docker.com/manuals/)

## Vitest
1. for testing, run `npm run test` after entering the docker container shell. Run `npm run test:watch` when modifying files as you test.

[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg)](https://classroom.github.com/online_ide?assignment_repo_id=19555150&assignment_repo_type=AssignmentRepo)
# Project-Starter

Please use the provided folder structure for your docs (project plan, design documenation, communications log, weekly logs and final documentation), source code, tesing, etc.    You are free to organize any additional internal folder structure as required by the project.  The team **MUST** use a branching workflow and once an item is ready, do remember to issue a PR, review and merge in into the master brach.
```
.
├── docs                    # Documentation files (alternatively `doc`)
│   ├── TOC.md              # Table of contents
│   ├── plan                # Scope and Charter
│   ├── design              # Getting started guide
│   ├── final               # Getting started guide
│   ├── logs                # Team Logs
│   └── ...
├── build                   # Compiled files (alternatively `dist`))    
├── app                     # Source files (alternatively `lib` or `src`)
├── test                    # Automated tests (alternatively `spec` or `tests`)
├── tools                   # Tools and utilities
├── LICENSE                 # The license for this project 
└── README.md
```
You can find additional information on folder structure convetions [here](https://github.com/kriasoft/Folder-Structure-Conventions). 

Also, update your README.md file with the team and client/project information.  You can find details on writing GitHub Markdown [here](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax) as well as a [handy cheatsheet](https://enterprise.github.com/downloads/en/markdown-cheatsheet.pdf).   

# Spring Boot
You can find documentation for the framework [here](https://docs.spring.io/spring-boot/index.html)

Since there's no hot reloading with the docker containers, it makes more sense when we are developing the backend to just have the DB and frontend running
in the containers, and run the backend in the command line with `mvn spring-boot:run`. This can restart the application faster to see changes than needing to rebuild the container every time we change something. We can still use it as a container when deploying, or if you'd really rather wait for the container to build each time you make a change.

For this to work, make sure you have open [jdk 24](https://jdk.java.net/24/) in your path system environment variables (or through a package manager), and [Maven 3.9.9](https://maven.apache.org/download.cgi) also in your path or through a package manager.

When it's running the application properties should default to dev unless started as a container, which will adjust the url to connect to the running MySQL container.



