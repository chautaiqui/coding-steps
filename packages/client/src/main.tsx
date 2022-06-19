import "./index.css";
import "./userWorker";

import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";

import { AuthContext } from "./context";
import { HomePage } from "./routes/home-page";
import { TasksPage } from "./routes/tasks-page";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("[index.html] missing root element");
const root = ReactDOM.createRoot(rootEl);

function RequireAuth({ children }: { children: JSX.Element }) {
    const [loading, setLoading] = useState(true);
    let { token, setToken } = useContext(AuthContext);
    let location = useLocation();

    const verifyUser = useCallback(() => {
        setLoading(true);
        fetch("http://localhost:3001/auth/refreshToken", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
        })
            .then(async (response) => {
                if (response.ok) {
                    const data = await response.json();
                    setToken(data.token);
                    setLoading(false);
                } else {
                    setToken(null);
                    setLoading(false);
                }
            })
            .catch((error) => {
                setLoading(false);
            });
    }, [setToken]);

    useEffect(() => {
        verifyUser();
    }, [verifyUser]);

    if (loading) return <h1>Loading</h1>;
    else if (!token) {
        return <Navigate to="/" state={{ from: location }} replace />;
    } else return children;
}

function App() {
    const [token, setToken] = useState(null);
    const value = useMemo(() => ({ token, setToken }), [token]) as any;

    return (
        <AuthContext.Provider value={value}>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route
                        path="/tasks"
                        element={
                            <RequireAuth>
                                <TasksPage />
                            </RequireAuth>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </AuthContext.Provider>
    );
}

root.render(<App />);
