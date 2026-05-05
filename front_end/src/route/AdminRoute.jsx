import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function AdminRoute({children}){
    const [status, setStatus] = useState("loading");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setStatus("unauthorized");
            return;
        }

        let alive = true;

        fetch("http://localhost:3000/api/auth/me", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(async (res) => {
                if (!res.ok) {
                    throw new Error("unauthorized");
                }
                return res.json();
            })
            .then((data) => {
                if (!alive) return;
                if (data?.user?.role === "admin") {
                    setStatus("allowed");
                } else {
                    setStatus("forbidden");
                }
            })
            .catch(() => {
                if (alive) {
                    setStatus("unauthorized");
                }
            });

        return () => {
            alive = false;
        };
    }, []);

    if (status === "loading") return <div>Loading...</div>;
    if (status === "unauthorized") return <Navigate to='/sign_in' replace />;
    if (status === "forbidden") return <Navigate to='/' replace />;
    return children;
}
