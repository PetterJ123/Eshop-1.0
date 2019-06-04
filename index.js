/*
    Created by Petter Johansson 15/3 - 2019
*/

/**
 * TODO GENERAL:
 * - Do backup of database (mysqldump --routines)
 */

"use strict";

const port = process.env.DBWEBB_prot || 1337;
const path = require("path");
const express = require("express");
const app = express();
const routeIndex = require("./eshop/index.js");
const middleware = require("./middleware/index.js");

// App usages
app.use(middleware.logIncomingToConsole);
app.use(express.static(path.join(__dirname + "/public")));
// ===Routes===
app.use("/", routeIndex);
// ===end of routes===
app.listen(port, logStartUpDetailsToConsole);   // app will listen to port 1337
app.set("view engine", "ejs");

function logStartUpDetailsToConsole() {
    let routes = [];

    app._router.stack.forEach((middleware) => {
        if (middleware.route) {
            routes.push(middleware.route);
        } else if (middleware.name === "router") {
            middleware.handle.stack.forEach((handler) => {
                let route;

                route = handler.route;
                route && routes.push(route);
            });
        }
    });

    console.info(`Server is listening on port ${port}.`);
    console.info("Available routes are: ");
    console.info(routes);
}
