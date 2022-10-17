"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const app_1 = require("./app");
const server = (0, http_1.createServer)(app_1.app);
server.listen(process.env.PORT, () => {
    console.log('Server listening on http://localhost:' + process.env.PORT);
});
