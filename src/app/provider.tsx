"use client"
import { supabase } from '@/services/supabaseClient'
import React, { useEffect, useState } from 'react'

const Provider = () => {

    const [user, setUser] = useState<Array<any> | null>(null);

    const CreateNewUser = async () => {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.error("Auth error or no user:", authError);
            return;
        }

        const { data: users, error: selectError } = await supabase
            .from('users') // ✅ renamed table to 'users'
            .select('*')
            .eq('email', user.email);

        if (selectError) {
            console.error("Select error:", selectError);
            return;
        }

        if (!users || users.length === 0) {
            const { data: insertData, error: insertError } = await supabase.from('users').insert([
                {
                    username: user.user_metadata?.full_name?.split[' '][0] || '',
                    full_name: user.user_metadata?.full_name || '',
                    email: user.email,
                    avatar_url: user.user_metadata?.avatar_url || '',
                }
            ]);

            if (insertError) {
                console.error("Insert error:", insertError);
            } else {
                console.log("User inserted:", insertData);
            }
        } else {
            console.log("User already exists:", users[0]);
        }
        setUser(users);
    };

    useEffect(() => {
        CreateNewUser()
    }, []);

    return (
        <></>
    )
}

export default Provider