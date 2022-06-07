import * as monaco from "monaco-editor";
import { useEffect, useRef, useState } from "react";

import styles from "./Editor.module.css";
import { initializeLanguageClient } from "./intellisense";
import { executeCode, sendValue, shellSocket } from "./shell";

export const Editor = () => {
    const [editor, setEditor] =
        useState<monaco.editor.IStandaloneCodeEditor | null>(null);
    const monacoEl = useRef(null);
    const [output, setOutput] = useState<string[]>([]);
    const [input, setInput] = useState<string>("");
    const [connected, setConnected] = useState(false);
    const [displaySend, setDisplaySend] = useState(false);
    const [running, setRunning] = useState(false);

    useEffect(() => {
        if (monacoEl && !editor) {
            initializeLanguageClient();

            setEditor(
                monaco.editor.create(monacoEl.current!, {
                    value: `print("hello world")`,
                    language: "python",
                    automaticLayout: true,
                    fontSize: 18,
                    lineHeight: 30,
                })
            );
        }

        return () => editor?.dispose();
    }, [monacoEl.current]);

    useEffect(() => {
        shellSocket.onmessage = (message: any) => {
            const data = JSON.parse(message.data);

            if (data.type === "stdout") {
                if (data.out.split("\n").length > 0) {
                    setOutput([...output, ...data.out.split("\n")]);
                } else {
                    setOutput([...output, data.out]);
                }
            }

            if (data.type === "stderr") {
                setOutput([...output, data.err]);
            }

            if (data.type === "close") {
                setRunning(false);
            }
        };
    });

    useEffect(() => {
        shellSocket.onopen = () => {
            setConnected(true);
        };
    });

    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div>
            <button
                onClick={() => {
                    setOutput([]);
                    setRunning(true);
                    executeCode(editor?.getValue());
                }}
            >
                run
            </button>
            <span>{connected ? "connected" : "connecting"}</span>

            <div className={styles.editor} ref={monacoEl}></div>

            <div>
                {output.map((line, index) => (
                    <p key={"key-" + index}>{line}</p>
                ))}

                {running && (
                    <div>
                        <input
                            ref={inputRef}
                            onChange={(event) => {
                                setInput(event.target.value);

                                if (event.target.value === "") {
                                    setDisplaySend(false);
                                } else {
                                    setDisplaySend(true);
                                }
                            }}
                        />
                        {displaySend && (
                            <button
                                onClick={() => {
                                    if (inputRef.current) {
                                        inputRef.current.value = "";
                                        setDisplaySend(false);
                                    }

                                    sendValue(input);
                                }}
                            >
                                send
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
