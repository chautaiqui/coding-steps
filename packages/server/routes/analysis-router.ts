import express from "express";

// import { TaskUserDataBaseline, TaskUserDataCodex, UserTaskDataBaseline, UserTaskDataCodex } from "../data/data";

export const analysisRouter = express.Router();

analysisRouter.post("/agg-data-user-task-list", (req, res, next) => {
    const { taskList } = req.body;

    try {
        if (taskList !== undefined) {
            let data = [];

            for (const { taskId, userId } of taskList) {
                if (true) {
                    data.push(
                        [].find(
                            (d: any) => d.user_id === userId
                        )
                    );
                }
            }

            res.send({ data });
        }
    } catch (e) {
        console.log(e);
    }
});

analysisRouter.get(
    "/agg-data-per-task-codex/:taskId",
    async (req, res, next) => {
        const { taskId } = req.params;

        try {
            if (taskId !== undefined) {
                res.send({ data: [] });
            }
        } catch (e) {
            console.log(e);
        }
    }
);

analysisRouter.get(
    "/agg-data-per-user-codex/:userId",
    async (req, res, next) => {
        const { userId } = req.params;

        try {
            if (userId !== undefined) {
                res.send({ data: [] });
            }
        } catch (e) {
            console.log(e);
        }
    }
);

analysisRouter.get("/agg-data-keys-codex", async (req, res, next) => {
    try {
        res.send({
            tasks: Object.keys([]),
            users: Object.keys([]),
        });
    } catch (e) {
        console.log(e);
    }
});

analysisRouter.get(
    "/agg-data-per-task-baseline/:taskId",
    async (req, res, next) => {
        const { taskId } = req.params;

        try {
            if (taskId !== undefined) {
                res.send({ data: [] });
            }
        } catch (e) {
            console.log(e);
        }
    }
);

analysisRouter.get(
    "/agg-data-per-user-baseline/:userId",
    async (req, res, next) => {
        const { userId } = req.params;

        try {
            if (userId !== undefined) {
                res.send({ data: [] });
            }
        } catch (e) {
            console.log(e);
        }
    }
);

analysisRouter.get("/agg-data-keys-baseline", async (req, res, next) => {
    try {
        res.send({
            tasks: Object.keys([]),
            users: Object.keys([]),
        });
    } catch (e) {
        console.log(e);
    }
});
