// const { response } = require('express');
const express = require('express');

function usersController(usersService, exerciseLogsService, opts = {}) {
    const router = new express.Router({ mergeParams: true });

    router.get("/", async (req, resp, next) => {
        try {
            const users = await usersService.findAllUsers();
            resp.json(users.map(u => ({
                _id: u._id,
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
                resp.json({ error: "user not found" });
                return;
            }

            const {
                description,
                duration,
                date,
            } = req.body;

            const log = await exerciseLogsService.addLog({
                userId: user._id,
                description,
                duration,
                date,
            });

            resp.json({
                ...user,
                exercise: log,
            });
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

            const logs = await exerciseLogsService.findLogs({
                userId: user._id,
                filters: { from, to, limit },
            });

            resp.json({
                ...user,
                count: logs.length,
                log: logs.map((log) => ({
                    _id: log._id,
                    description: log.description,
                    duration: log.duration,
                    date: log.date,
                })),
            });
        } catch (err) {
            next(err);
        }
    });

    return router
}

module.exports = usersController;
