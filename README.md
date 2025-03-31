# Gatemate Team 7 - Spring 2024
- A web app using react,vite,express,and node to monitor and adjust gatemates at any time or place

## Table of Contents
- [General Info](#general-info)
- [Setup](#setup)
- [Updating](#updating)
- [Running](#running)
- [File Contents](#file-Contents)

## General Info
- Project Contributors: -------------

## Setup
### Install
- [Node](https://nodejs.org/en/download)
- [Git](https://git-scm.com/download/win)
- [tmux](https://github.com/tmux/tmux/wiki)
- (Optional) [vscode](https://code.visualstudio.com/download)
#### Window Node Path Configuration  
- Navigate to set path variable ->
  - advanced system settings
  - environment variables
  - new user variable
  - variable name: `node.js`
  - variable value: `C:\Program Files\nodejs`
#### (Optional) vscode Prettier Setup
`https://www.alphr.com/use-prettier-vs-code/`
### Clone repository
`git clone https://github.com/Zeanderson/Gatemate.git`
### Environment variables
Fill out the env variables in `run.sh`

## Updating
Change `UPDATE=0` to `UPDATE=1` in `run.sh` to perform NPM updates on running.

## Running
`./run.sh`

## File Contents
- /server
  - src
    - controllers
      - Each API made in 'express-server.ts' will have a corresponding controller file with a router created. CRUD operations go inside of this file (get,post). No logic here, just error handle
    - datasources
      - Logic for localized api's go here, and api data from out sourced data
      - db.ts
        - This database datasource is where all queries for mongoDB will be held
    - express-server.ts
      - The brains of the backend including the app becoming a express backend. Middleware for the application goes here, and definitions of localized apis we will be using
    - types-ts
      - Types for all datasource data
- /client
  - src
    - components
      - These are "plug-in-play" tsx files that include things such as Spinners, Banners, Popups
    - routes
      - Routes are each page that the user sees. Signin page (signin.tsx) --> Home page (home.tsx)
    - app.tsx
      - This is where the react-router is created, and how to define new paths on the app
    - index.css
      - This project uses tailwind, but it uses this file to style every pages "theme"
    - main.tsx
      - Entry point to for react-scripts to build and start the app
  - vite.config.ts
    - This is where you setup the front end proxy for the backend 'express-server'