// const { response } = require('express');
const dateformat = require('dateformat');
const express = require('express');

const DATE_FORMAT = 'ddd mmm dd yyyy';

function usersController(usersService, exerciseLogsService, opts = {}) {
    const router = new express.Router({ mergeParams: true });

    router.get("/", async (req, resp, next) => {
        try {
            const users = await usersService.findAllUsers();
            resp.json(users.map(u => ({
                _id: `${u._id}`,
                username: u.username,
            })));
        } catch (err) {
            next(err);
        }
    });

    router.post("/", async (req, resp, next) => {
        try {
            if (!req.body) {
                resp.json({ error: 'invalid form data' });
                return;
            }
            const username = req.body.username;
            if (!username) {
                resp.json({ error: 'invalid form data' });
                return;
            }
            const existingUser = await usersService.getUserByName(username);
            if (existingUser) {
                resp.json({ error: "user already exists" });
                return;
            }

            const user = await usersService.addUser({ username });

            resp.json({
                _id: user._id,
                username: user.username,
            });
        } catch (err) {
            next(err);
        }
    });

    router.post("/:_id/exercises", async (req, resp, next) => {
        try {
            const user = await usersService.getUser(req.params._id);
            if (!user) {
                const respBody = { error: "user not found" };
                //TEST
                console.log("reqBody:", req.body, " => respBody:", resp.body);
                resp.json(respBody);
                return;
            }

            for (let fld of ['description', 'duration']) {
                if (!req.body[fld]) {
                    resp.status(400);
                    //Copy example response
                    resp.send(`Path \`${fld}\` is required.`); //.json({ error: 'invalid duration' });
                    return;
                }
            }

            const {
                description,
                duration,
                date,
            } = req.body;

            const log = await exerciseLogsService.addLog({
                userId: user._id,
                description,
                duration: Number(duration),
                date: (date) ? new Date(date) : undefined,
            });

            const respBody = {
                _id: `${user._id}`,
                username: user.username,
                date: (log.date) ? dateformat(log.date, DATE_FORMAT) : undefined,
                duration: log.duration,
                description,
                // exercise: log,
            };
            //TEST
            console.log("reqBody:", req.body, " => respBody:", resp.body);

            resp.json(respBody);
        } catch (err) {
            next(err);
        }
    });

    router.get('/:_id/logs', async (req, resp, next) => {
        try {
            const user = await usersService.getUser(req.params._id);
            if (!user) {
                resp.json({ error: "user not found" });
                return;
            }

            const {
                from,
                to,
                limit,
            } = req.query;

            const filters = {
                from: (from) ? new Date(from) : undefined,
                to: (to) ? new Date(to) : undefined,
                limit: (limit) ? Number(limit) : undefined,
            };

            const logs = await exerciseLogsService.findLogs({
                userId: user._id,
                filters,
            });

            resp.json({
                _id: `${user._id}`,
                username: user.username,
                count: logs.length,
                from: (filters.from) ? dateformat(filters.from, DATE_FORMAT) : undefined,
                to: (filters.to) ? dateformat(filters.to, DATE_FORMAT) : undefined,
                limit: filters.limit,
                log: logs.map((log) => ({
                    _id: `${log._id}`,
                    description: log.description,
                    duration: log.duration,
                    date: (log.date) ? dateformat(log.date, DATE_FORMAT) : undefined,
                })),
            });
        } catch (err) {
            next(err);
        }
    });

    return router
}

module.exports = usersController;
