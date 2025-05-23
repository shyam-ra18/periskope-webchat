'use client';

import "@/app/globals.css";
import { supabase } from '@/services/supabaseClient';
import GoogleButton from '@/shared/components/google-button';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import bcrypt from 'bcryptjs';
import { SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from 'next/navigation';
import { generateToken } from "@/utils/generateToken";
import Cookies from 'js-cookie';

interface LoginFormData {
    username: string;
    fullname: string;
    email: string;
    phone: string;
    password?: string;
}

interface ProceedWithLoginProps extends LoginFormData {
    otp: string;
    setLoading: (loading: boolean) => void;
}

const Login = () => {
    const [email, setEmail] = useState<string>('');
    const [phone, setPhone] = useState<string>('');
    const [otp, setOtp] = useState<string>('');
    const [showOtpInput, setShowOtpInput] = useState<boolean>(false);
    const [isGoogleLogin, setIsGoogleLogin] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [emailToVerify, setEmailToVerify] = useState("");
    const router = useRouter();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const {
        register,
        handleSubmit,
        setValue,
        getValues,
        formState: { errors },
    } = useForm();

    // Unified OTP sending logic
    const requestOtp = async (email: string) => {
        try {
            setLoading(true);
            const res = await fetch("/api/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (data.success) {
                setShowOtpInput(true);
                toast.success(`we have sent an OTP to ${email}`);
            } else {
                toast.error(data.error || "Failed to send OTP");
            }
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong while sending OTP");
        }
        finally {
            setLoading(false);
        }
    };

    // Google sign-in + OTP send
    const signInWithGoogle = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
            });

            if (error) {
                toast.error(error.message);
                console.error('Error signing in with Google:', error);
                return;
            }

            // Wait for session to establish before accessing email
            supabase.auth.onAuthStateChange(async (event, session) => {
                if (session?.user?.email) {
                    setIsGoogleLogin(true);
                    setEmail(session.user.email);
                    await requestOtp(session.user.email);
                }
            });
        } catch (error) {
            console.error('Error signing in with Google:', error);
            toast.error('Error signing in with Google');
        } finally {
            setLoading(false);
        }
    };


    const onEmailLogin: SubmitHandler<LoginFormData> = async (data) => {
        const { email } = data;
        setEmailToVerify(email);
        setLoading(true);
        try {
            const res = await fetch("/api/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const result = await res.json();

            if (result.success) {
                toast.success("OTP sent to your email");
                setShowOtpInput(true);
            } else {
                toast.error("Failed to send OTP");
            }
        } catch (err) {
            console.log("err:", err);
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const proceedWithLogin = async ({
        email,
        phone,
        otp,
        password,
        username,
        fullname,
        setLoading,
    }: ProceedWithLoginProps) => {
        setLoading(true);

        try {
            if (otp && otp.length === 6) {
                // ✅ Step 1: Verify OTP
                const res = await fetch("/api/verify-otp", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, otp }),
                });

                const data = await res.json();

                if (!data.success) {
                    toast.error(data.message || "Invalid OTP");
                    return;
                }

                // ✅ Step 2: Check or create user
                let { data: existingUser, error: fetchError } = await supabase
                    .from("users")
                    .select("*")
                    .eq("email", email)
                    .maybeSingle();

                if (fetchError) throw fetchError;

                if (!existingUser) {
                    const { data: newUser, error: insertError } = await supabase
                        .from("users")
                        .insert([{
                            email,
                            phone,
                            username,
                            full_name: fullname,
                            ...(password && { password: await bcrypt.hash(password, 10) }),
                        }])
                        .select()
                        .single();

                    if (insertError) throw insertError;
                    existingUser = newUser;
                }

                // ✅ Step 3: Generate token on the server and set cookie
                const loginRes = await fetch("/api/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        user: existingUser
                    }),
                });

                const loginData = await loginRes.json();
                if (!loginData.success) {
                    toast.error("Failed to set session");
                    return;
                }

                toast.success("Logged in!");
                router.push("/chats");
            }
        } catch (err) {
            console.error(err);
            toast.error("Login failed");
        } finally {
            setLoading(false);
        }
    };

    const onSubmitOtpFlow = async () => {
        const { username, fullname, email, phone, password } = getValues();
        await proceedWithLogin({
            email,
            phone,
            otp,
            password,
            username,
            fullname,
            setLoading,
        });
    };

    const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*$/.test(value) && value.length <= 6) {
            setOtp(value);
        }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*$/.test(value) && value.length <= 10) {
            setPhone(value);
        }
    };

    return (
        <div className="flex h-screen w-full">
            <Toaster />

            {/* LEFT */}
            <section className="flex flex-1 flex-col justify-center items-center bg-white border-r border-gray-200 px-4">
                <div className="w-xs space-y-6">
                    <div className="flex flex-col items-center gap-4">
                        <Image src="/assets/logo.svg" alt="Periskope Logo" width={80} height={80} />
                        <h1 className="mt-2 text-xl font-semibold text-neutral-600 text-center">Log in to Periskope</h1>
                    </div>

                    <form
                        onSubmit={
                            showOtpInput ? handleSubmit(onSubmitOtpFlow) : handleSubmit(onEmailLogin)
                        }
                        className="w-full flex flex-col gap-4"
                    >
                        {showOtpInput ? (
                            <>
                                <div className="flex flex-col items-center gap-2">
                                    <p className="text-sm">We’ve sent an OTP to:</p>
                                    <p className="font-semibold">{emailToVerify}</p>
                                </div>

                                <input
                                    type="text"
                                    placeholder="6-digit OTP"
                                    maxLength={6}
                                    value={otp}
                                    onChange={handleOtpChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-[#15803D] text-black text-xl font-semibold tracking-wider"
                                />

                                <button
                                    type="submit"
                                    disabled={(otp.length !== 6) || loading}
                                    className="w-full py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 rounded-md transition text-sm font-semibold disabled:cursor-not-allowed"
                                >
                                    {loading ? "Verifying..." : "Submit"}
                                </button>
                            </>
                        ) : (
                            <>
                                <button type="button" onClick={() => signInWithGoogle()} className="w-full">
                                    <GoogleButton />
                                </button>

                                <div className="border-t border-gray-300" />

                                <input
                                    type="text"
                                    placeholder="Enter your username"
                                    {...register("username", { required: true })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#15803D] outline-[#15803D]"
                                />
                                <input
                                    type="text"
                                    placeholder="Enter your full name"
                                    {...register("fullname", { required: true })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#15803D] outline-[#15803D]"
                                />
                                <input
                                    type="text"
                                    placeholder="Enter your phone"
                                    {...register("phone", { required: true })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#15803D] outline-[#15803D]"
                                />
                                <input
                                    type="email"
                                    placeholder="Enter your official email"
                                    {...register("email", { required: true })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#15803D] outline-[#15803D]"
                                />

                                <button
                                    type="submit"
                                    className="w-full py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium rounded-md focus:ring-[#15803D] outline-[#15803D]"
                                    disabled={loading}
                                >
                                    {loading ? "Sending..." : "Continue with Email"}
                                </button>
                            </>
                        )}
                    </form>

                    <p className="text-center text-sm text-gray-500">
                        By signing up, you agree to Periskope’s{' '}
                        <a href="/terms" className="text-neutral-600 underline">Terms of Service</a>{' '}
                        and{' '}
                        <a href="/privacy" className="text-neutral-600 underline">Privacy Policy</a>.
                    </p>
                </div>
            </section>

            {/* RIGHT */}
            <div className="hidden xl:flex flex-col justify-center items-center w-3/5 px-12 bg-gray-50 border-l border-gray-200 space-y-8 chatBg">
                <div className="text-center max-w-lg">
                    <h2 className="text-3xl font-bold text-[#15803D]">Add Tasks and Reminders</h2>
                    <p className="mt-2 text-gray-600">
                        Create tasks and reminders on chats, messages, and tickets to track important actions and receive timely reminders.
                    </p>
                </div>
                <div className="w-full max-w-2xl aspect-video">
                    <iframe
                        className="w-full h-full rounded-lg shadow-lg"
                        src="https://www.youtube.com/embed/ylV7mvu1g4g?si=yDdDki5i6XqEBrIm"
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                    />
                </div>
                <button className="py-2 px-4 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium rounded-md text-sm">
                    Read Docs
                </button>
            </div>
        </div>
    );
};

export default Login;
