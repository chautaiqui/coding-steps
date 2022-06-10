import express from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import passport from "passport";

import { User } from "../models/user";
import { COOKIE_OPTIONS, getRefreshToken, getToken, verifyUser } from "../utils/authenticate";
import env from "../utils/env";

export const loginRouter = express.Router();

loginRouter.post("/signup", (req, res, next) => {
    if (!req.body.firstName) {
        res.statusCode = 500;

        res.send({
            name: "FirstNameError",
            message: "The first name is required",
        });
    } else {
        User.register(
            new User({ username: req.body.username }),
            req.body.password,
            (err, user) => {
                if (err) {
                    res.statusCode = 500;
                    res.send(err);
                } else {
                    user.firstName = req.body.firstName;
                    user.lastName = req.body.lastName || "";
                    const token = getToken({ _id: user._id });
                    const refreshToken = getRefreshToken({ _id: user._id });
                    user.refreshToken.push({ refreshToken });

                    user.save((err: any, user: any) => {
                        if (err) {
                            res.statusCode = 500;
                            res.send(err);
                        } else {
                            res.cookie(
                                "refreshToken",
                                refreshToken,
                                COOKIE_OPTIONS
                            );
                            res.send({ success: true, token });
                        }
                    });
                }
            }
        );
    }
});

loginRouter.post(
    "/login",
    passport.authenticate("local", { session: false }),
    (req: any, res, next) => {
        const token = getToken({ _id: req.user._id });
        const refreshToken = getRefreshToken({ _id: req.user._id });

        User.findById(req.user._id).then(
            (user: any) => {
                user.refreshToken.push({ refreshToken });

                user.save((err: any, user: any) => {
                    if (err) {
                        res.statusCode = 500;
                        res.send(err);
                    } else {
                        res.cookie(
                            "refreshToken",
                            refreshToken,
                            COOKIE_OPTIONS
                        );
                        res.send({ success: true, token });
                    }
                });
            },
            (err) => next(err)
        );
    }
);

loginRouter.post("/refreshToken", (req, res, next) => {
    const { signedCookies = {} } = req;
    const { refreshToken } = signedCookies;

    if (refreshToken) {
        try {
            const payload = jwt.verify(
                refreshToken,
                env.REFRESH_TOKEN_SECRET
            ) as jwt.JwtPayload;
            const userId = payload._id;

            User.findOne({ _id: userId }).then(
                (user: any) => {
                    if (user) {
                        // Find the refresh token against the user record in database
                        const tokenIndex = user.refreshToken.findIndex(
                            (item: any) => item.refreshToken === refreshToken
                        );

                        if (tokenIndex === -1) {
                            res.statusCode = 401;
                            res.send("Unauthorized");
                        } else {
                            const token = getToken({ _id: userId });
                            // If the refresh token exists, then create new one and replace it.
                            const newRefreshToken = getRefreshToken({
                                _id: userId,
                            });
                            user.refreshToken[tokenIndex] = {
                                refreshToken: newRefreshToken,
                            };
                            user.save((err: any, user: any) => {
                                if (err) {
                                    res.statusCode = 500;
                                    res.send(err);
                                } else {
                                    res.cookie(
                                        "refreshToken",
                                        newRefreshToken,
                                        COOKIE_OPTIONS
                                    );
                                    res.send({ success: true, token });
                                }
                            });
                        }
                    } else {
                        res.statusCode = 401;
                        res.send("Unauthorized");
                    }
                },
                (err) => next(err)
            );
        } catch (err) {
            res.statusCode = 401;
            res.send("Unauthorized");
        }
    } else {
        res.statusCode = 401;
        res.send("Unauthorized");
    }
});

loginRouter.get("/verify", verifyUser, (req, res, next) => {
    res.send(req.user);
});

loginRouter.get("/logout", verifyUser, (req: any, res: any, next) => {
    const { signedCookies = {} } = req;
    const { refreshToken } = signedCookies;

    User.findById(req.user._id).then(
        (user: any) => {
            const tokenIndex = user.refreshToken.findIndex(
                (item: any) => item.refreshToken === refreshToken
            );

            if (tokenIndex !== -1) {
                user.refreshToken
                    .id(user.refreshToken[tokenIndex]._id)
                    .remove();
            }

            user.save((err: any, user: any) => {
                if (err) {
                    res.statusCode = 500;
                    res.send(err);
                } else {
                    res.clearCookie("refreshToken", COOKIE_OPTIONS);
                    res.send({ success: true });
                }
            });
        },
        (err) => next(err)
    );
});