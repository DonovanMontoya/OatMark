import { useState, useEffect } from "react";
import { getIdTokenResult } from "firebase/auth";
import { auth } from "../services/firebase";

export const useAdminStatus = () => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAdminStatus = async () => {
            try {
                if (!auth.currentUser) {
                    setIsAdmin(false);
                    setIsLoading(false);
                    return;
                }

                const tokenResult = await getIdTokenResult(auth.currentUser);
                setIsAdmin(!!tokenResult.claims.admin);
            } catch (error) {
                console.error("Error checking admin status:", error);
                setIsAdmin(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAdminStatus();
    }, []);

    return { isAdmin, isLoading };
};