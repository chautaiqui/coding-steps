import { Fragment, useContext, useEffect, useRef, useState } from "react";

import {
    apiLogEvents,
    apiUserEvaluateCode,
    apiUserGradingStatus,
    apiUserStartTask,
    apiUserSubmitTask,
    logError,
} from "../api/api";
import { AuthContext } from "../context";
import { TaskType } from "../utils/constants";
import { getLogObject } from "../utils/logger";
import { convertTime } from "../utils/shared";
import { Button } from "./button";
import { Editor } from "./editor";

interface CodingTaskProps {
    taskId: string;
    description: string;
    output: Array<Array<string>>;
    solution: string;
    timeLimit: number;
    starterCode?: string;

    taskType: TaskType;
    showCodex: boolean;

    onCompletion: () => void;
}

export const CodingTask = (props: CodingTaskProps) => {
    const { context, setContext } = useContext(AuthContext);
    const editorRef = useRef<any>(null);

    const [started, setStarted] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [skipped, setSkipped] = useState(false);

    const [startTime, setStartTime] = useState(Date.now());
    const [elapsedTime, setElapsedTime] = useState(0);
    const [checkingTime, setCheckingTime] = useState(0);
    const [reachedTimeLimit, setReachedTimeLimit] = useState(false);

    const [beingGraded, setBeingGraded] = useState(false);

    const [feedback, setFeedback] = useState("");
    const [userCode, setUserCode] = useState("");
    const [canSubmit, setCanSubmit] = useState(false);

    const sendLog = () => {
        apiLogEvents(
            context?.token,
            props.taskId,
            getLogObject(props.taskId, context?.user?.id)
        )
            .then(() => {})
            .catch((error) => {
                logError("sendLog: " + error.toString());
            });
    };

    const handleSkipTask = () => {
        apiUserSubmitTask(
            context?.token,
            props.taskId,
            {
                code: userCode,
            },
            new Date()
        )
            .then(async (response) => {
                sendLog();

                if (props.taskType == TaskType.Authoring) {
                    editorRef.current?.setCode(props.solution);
                }

                setSkipped(true);
            })
            .catch((error: any) => {
                logError("handleSkipTask: " + error.toString());
            });
    };

    const handleGradeCode = () => {
        apiUserEvaluateCode(context?.token, props.taskId, userCode)
            .then(async (response) => {
                const data = await response.json();

                if (data.success) {
                    setBeingGraded(true);
                }
            })
            .catch((error: any) => {
                logError("handleGradeCode: " + error.toString());
            });
    };

    const handleStart = () => {
        const now = Date.now();

        apiUserStartTask(context?.token, props.taskId)
            .then(async (response) => {
                const data = await response.json();

                if (data.success) {
                    setStarted(true);

                    if (data.canContinue) {
                        if (data.feedback) {
                            setFeedback(data.feedback);
                        }

                        setStartTime(Date.parse(data.startedAt));
                        setCheckingTime(data.checkingTime);
                        setElapsedTime(
                            now - Date.parse(data.startedAt) - data.checkingTime
                        );
                    } else {
                        setStartTime(now);
                        setElapsedTime(now - startTime);
                    }

                    if (data.beingGraded) {
                        // the user has already submitted the task and should wait for the result
                        setBeingGraded(true);
                    }
                }
            })
            .catch((error: any) => {
                logError("handleStart: " + error.toString());
            });
    };

    const getGradingStatus = (timerId: any) => {
        apiUserGradingStatus(context?.token, props.taskId)
            .then(async (response) => {
                const data = await response.json();

                if (!data.beingGraded) {
                    setCheckingTime(data.checkingTime);
                    setBeingGraded(false);
                    clearInterval(timerId);
                    setFeedback(data.feedback);

                    if (data.passed) {
                        sendLog();

                        setCompleted(true);
                        props.onCompletion(); // go to the next task
                    }
                }
            })
            .catch((error: any) => {
                logError("apiUserGradingStatus: " + error.toString());
            });
    };

    useEffect(() => {
        if (beingGraded) {
            const id = setInterval(() => {
                // check task status
                // if completed, either pass or fail
                getGradingStatus(id);
            }, 1000);

            return () => {
                clearInterval(id);
            };
        }
    }, [beingGraded]);

    useEffect(() => {
        const id = setInterval(() => {
            if (!beingGraded) {
                setElapsedTime(Date.now() - startTime - checkingTime);

                // is there enough time to continue?
                if (elapsedTime / 1000 > props.timeLimit) {
                    setReachedTimeLimit(true);
                }
            }
        }, 1000);

        return () => {
            clearInterval(id);
        };
    }, [startTime, beingGraded, elapsedTime]);

    const handleGoNextTask = () => {
        setCompleted(true);
        props.onCompletion();
    };

    useEffect(() => {
        if (userCode.length > 10) {
            setCanSubmit(true);
        } else {
            setCanSubmit(false);
        }
    }, [userCode]);

    if (beingGraded) {
        return (
            <div className="container">
                <div className="card p-md">
                    <p>
                        Your submission is being graded. We will get back to you
                        soon. Your timer is paused.
                    </p>
                </div>
            </div>
        );
    }

    if (!started) {
        return (
            <div className="container">
                <div className="card p-md">
                    <p>
                        You have{" "}
                        <span className="remaining-time">
                            {convertTime(props.timeLimit)} minutes
                        </span>{" "}
                        to finish this task.
                    </p>
                    <button className="btn btn-primary" onClick={handleStart}>
                        Start task
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="coding-task-container">
            <section className="task-info">
                <div>
                    <span className="task-title">Task Description:</span>
                    <span className="task-subtitle">
                        <p
                            dangerouslySetInnerHTML={{
                                __html: props.description,
                            }}
                        ></p>
                    </span>

                    <span className="task-sample-output-header">Sample:</span>
                    {props.output.map((lines, i) => {
                        return (
                            <div
                                key={`sample-out-key-${i}`}
                                className="task-sample-output"
                            >
                                <span>
                                    {lines.map((line, j) => {
                                        return (
                                            <p
                                                key={`sample-line-key-${j}`}
                                                dangerouslySetInnerHTML={{
                                                    __html: line,
                                                }}
                                            ></p>
                                        );
                                    })}
                                </span>
                            </div>
                        );
                    })}

                    {feedback ? (
                        <div className="task-feedback-container">
                            <span className="feedback-header">Feedback:</span>
                            <span className="feedback-content">{feedback}</span>
                        </div>
                    ) : null}
                </div>

                <div>
                    {reachedTimeLimit && !skipped ? (
                        <div>
                            <Button
                                onClick={handleSkipTask}
                                type="block"
                                color="warning"
                            >
                                Skip Task
                            </Button>
                        </div>
                    ) : null}
                    {skipped ? (
                        <Button
                            onClick={handleGoNextTask}
                            type="block"
                            color="warning"
                        >
                            Start Next Task
                        </Button>
                    ) : null}

                    {!skipped ? (
                        <div className="submit-container">
                            {reachedTimeLimit ? (
                                <Fragment>
                                    <p className="submit-urgent-message">
                                        Hurry Up!!
                                        <br />
                                        You should submit the code now.
                                    </p>
                                    <div className="time-indicator-container">
                                        <span className="time-indicator">
                                            {convertTime(elapsedTime / 1000)}
                                        </span>
                                    </div>
                                </Fragment>
                            ) : null}

                            <Button
                                onClick={handleGradeCode}
                                type="block"
                                disabled={!canSubmit}
                            >
                                {beingGraded
                                    ? "Being Graded"
                                    : "Submit to Grade"}
                            </Button>
                        </div>
                    ) : null}
                </div>
            </section>

            <Editor
                ref={editorRef}
                showCodex={props.showCodex}
                taskId={props.taskId}
                starterCode={
                    userCode
                        ? userCode
                        : props.taskType === TaskType.Authoring
                        ? ""
                        : props.starterCode !== undefined
                        ? props.starterCode
                        : ""
                }
                updateCode={setUserCode}
            />
        </div>
    );
};

// when the user starts the code -> the timer starts (based on the start time -- as they could've started previously and still have time)
// they either submit the code in the given time -> and it gets checked -> and its ok -> and then go to the next activity
// or they submit the code after the time limit -> and it gets checked -> and its not ok -> and they continue working on the activitiy

// when the timer reaches 0
// it should continue going down. but should show a message saying that they have reached the time limit and that they should submit the code now

// in case that the next task is a modify task -> if the result was ok -> they should continue working on their own code for the next task
// however, if not, they could modify the given solution instead

// if the next task is not modify -> then just wait to see if it is correct or not -> though no need to wait if the time limit is reached

// submit to be checked -> when the task is AuthoringCode or there is some time in ModifyingCode, other tasks submit will be handled by those respective tasks.tsx pages
// otherwise -> submit but go to the next task without waiting for it to be checked

// we either have a starttime
// startTime + checkingTime
// -> start timer from either one of these two times

// we submit tasks -> pause timer
// -> they take a few seconds to get checked -> we can get the new checkingTime -> simply updates the checkingTime
