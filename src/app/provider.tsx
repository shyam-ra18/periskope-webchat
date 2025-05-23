"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/services/supabaseClient';
import Cookies from 'js-cookie';
import { jwtDecode } from "jwt-decode";

type DecodedToken = {
    id: string;
    email: string;
    username?: string;
    exp?: number;
};

const Provider = () => {
    const [user, setUser] = useState<any | null>(null);
    const router = useRouter();

    const createNewUserIfNeeded = async (decoded: DecodedToken) => {
        const { email, username, id } = decoded;

        const { data: existing, error: selectError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email);

        if (selectError) {
            console.error("User check failed:", selectError);
            return;
        }

        if (!existing || existing.length === 0) {
            const { data: inserted, error: insertError } = await supabase
                .from('users')
                .insert([
                    {
                        id,
                        email,
                        username,
                        full_name: username,
                        avatar_url: '', // optional default
                    },
                ])
                .select();

            if (insertError) {
                console.error("Insert failed:", insertError);
            } else {
                setUser(inserted[0]);
                console.log("User inserted:", inserted[0]);
            }
        } else {
            setUser(existing[0]);
            console.log("User already exists:", existing[0]);
        }
    };

    useEffect(() => {
        const checkAuth = async () => {
            const token = Cookies.get('access_token');

            if (!token) {
                router.push('/');
                return;
            }

            try {
                const decoded: DecodedToken = jwtDecode(token);
                console.log("decoded ==>", decoded)
                if (decoded.exp && decoded.exp < Date.now() / 1000) {
                    Cookies.remove('access_token');
                    router.push('/');
                    return;
                }

                await createNewUserIfNeeded(decoded);
            } catch (err) {
                console.error("Invalid token:", err);
                Cookies.remove('access_token');
                router.push('/');
            }
        };

        checkAuth();
    }, [router]);

    return null;
};

export default Provider;
