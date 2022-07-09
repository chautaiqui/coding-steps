import env from "../utils/env";

export const authRefresh = () =>
    fetch(env.API_URL + "/api/auth/refreshToken", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
    });

export const authLogin = (username: string, password: string) =>
    fetch(env.API_URL + "/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });

export const authLogout = (token: string | null | undefined) =>
    fetch(env.API_URL + "/api/auth/logout", {
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

export const authSignup = (
    firstName: string,
    lastName: string,
    username: string,
    password: string
) =>
    fetch(env.API_URL + "/api/auth/signup", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            firstName,
            lastName,
            username,
            password,
        }),
    });

export const apiAdminGetSubmissions = (token: string | null | undefined) =>
    fetch(env.API_URL + "/api/tasks/not-graded", {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

export const apiAdminSetGrade = (
    token: string | null | undefined,
    taskId: string,
    userId: string,
    passed: boolean,
    submittedAt: Date,
    index: number
) =>
    fetch(env.API_URL + "/api/tasks/set-grade", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            taskId,
            userId,
            passed,
            submittedAt,
            checkedAt: new Date(),
            index,
        }),
    });

export const apiUserNextTask = (token: string | null | undefined) =>
    fetch(env.API_URL + "/api/tasks/next", {
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

export const apiUserSubmitTask = (
    token: string | null | undefined,
    taskId: string,
    data: any,
    finishedAt?: Date,
    startedAt?: Date
) =>
    fetch(env.API_URL + "/api/tasks/submit/", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            taskId,
            submittedAt: new Date(),
            data,
            finishedAt,
            startedAt,
        }),
    });

export const apiUserStartTask = (
    token: string | null | undefined,
    taskId: string
) =>
    fetch(env.API_URL + "/api/tasks/start", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            taskId,
            // will be used if its the first time the user starts the task
            startedAt: new Date(),
        }),
    });

export const apiUserGradingStatus = (
    token: string | null | undefined,
    taskId: string
) =>
    fetch(env.API_URL + "/api/tasks/grading-status/" + taskId, {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

export const apiUserEvaluateCode = (
    token: string | null | undefined,
    taskId: string,
    code: string
) =>
    fetch(env.API_URL + "/api/tasks/eval-code", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            taskId,
            submittedAt: new Date(),
            data: { code },
        }),
    });

export const apiGenerateCodex = (
    token: string | null | undefined,
    description: string
) =>
    fetch(env.API_URL + "/api/codex/generate", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ description: description, type: "block" }),
    });

export const apiLogEvents = (
    token: string | null | undefined,
    taskId: string,
    log: any
) =>
    fetch(env.API_URL + "/api/tasks/log/", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            taskId,
            log,
        }),
    });