## Getting the Docker Container Started
1. Make sure you have docker installed on your computer
2. Navigate to the main folder
3. Fill out .env files if they exist.
4. Run `docker compose up --build` in the terminal. You don't need `--build` afterwards.
5. To access the container shell,  run `docker exec -it <container-name> sh`. Container name for the frontend is `frontend`.
6. When the container is running, website should be exposed at http://localhost:5173

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


