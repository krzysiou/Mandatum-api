# live-click-api

This is a ```Node.js RestAPI``` developed for my [live-click](https://github.com/krzysiou/live-click) website. It contains endpoints which allow front-end to send and request data. It got hot-reload feature using nodemon. To host server on your computer simply type ```npm install``` and follow it by ```nodemon index.js```.

## Technologies

- Express
- Joi
- Prisma
- Postgresql
- JWT

## Overview

The most important file on the whole server is [index.js](./source/server.ts), it contains all endpoints corresponding to given functions that will be called upon request hitting the endpoint.
I designed a few controllers located in [this folder](./source/controllers) they contain methods which operate on set of values and manage the data accordingly. Make sure to provide your working directory with ```.env file``` containing key ```ACCESS_TOKEN_SECRET=``` and give it a custom value of your choice. It is used to generate and sign JWT tokens. It should also contain ```PORT=``` and ```DATABASE_URL=``` which will allow you to start the backend with a database.

## Division

I divided the backend section into three parts ```Authorization Users and Validation```.

### Authorization [file](./source/authorization/checkAuth.ts)

This file contains method that authorizes every secured endpoint meaning that it guards contents of the page that shouldn't be operatable by users that are not logged in. It checks if JWT token was passed in a request header and verifies it by decoding the token using ```ACCESS_TOKEN_SECRET```
In case of successful authorization, user is allowed to access the endpoint. In any other case endpoint is blocked and error is sent to front-end.

### Users [file](./source/controllers/users.ts)

It consists of list of methods that allow server to fully operate on user data.

### Validation [file](./source/validation.ts)

This file is based on ```Joi's``` validation. It consists of schemas that are used to validate if values of keys of passed objects got valid properties.
The validation throws error if any of the properties isn't valid.

### Database [file](./prisma/schema.prisma)

A file containing schemas for the Prisma ORM that describe how databases and relations should be created.
