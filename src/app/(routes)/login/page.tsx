'use client';

import "@/app/globals.css";
import { supabase } from '@/services/supabaseClient';
import GoogleButton from '@/shared/components/google-button';
import Image from 'next/image';
import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import bcrypt from 'bcryptjs';
import { SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from 'next/navigation';

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
    const [password, setPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
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

    const togglePasswordVisibility = () => {
        setShowPassword(prev => !prev);
    };

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

    // Manual email login + OTP send
    const onEmailLoginold = async () => {
        if (!email || !emailRegex.test(email)) {
            toast.error("Please enter a valid email address");
            return;
        }
        setIsGoogleLogin(false);
        await requestOtp(email);
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
                const res = await fetch("/api/verify-otp", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, otp }),
                });

                const data = await res.json();
                if (data.success) {
                    const { data: existingUser, error: fetchError } = await supabase
                        .from("users")
                        .select("*")
                        .eq("email", email)
                        .maybeSingle();

                    console.log("existingUser", existingUser)

                    if (!existingUser) {
                        const { error } = await supabase.from("users").insert([
                            {
                                email,
                                phone,
                                username,
                                full_name: fullname,
                                ...(password && { password: await bcrypt.hash(password, 10) }),
                            },
                        ]);

                        if (error) throw error;
                    }

                    toast.success("Logged in!");
                    router.push('/chats');
                } else {
                    toast.error(data.message || "Invalid OTP");
                }
            }
        } catch (err) {
            toast.error("Login failed");
            console.error(err);
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


    const proceedWithLoginols = async () => {
        if (!email) {
            toast.error("Email is required");
            return;
        }

        setLoading(true);

        try {
            // 🔐 CASE 1: OTP Flow
            if (otp && otp.length === 6) {
                const response = await fetch("/api/verify-otp", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, otp }),
                });

                const data = await response.json();

                if (data.success) {
                    // Insert user with phone if not already exists
                    const { data: existingUser, error: fetchError } = await supabase
                        .from("users")
                        .select("*")
                        .eq("email", email)
                        .single();

                    if (fetchError && fetchError.code !== "PGRST116") {
                        console.error("Fetch error:", fetchError);
                        toast.error("Error checking existing user");
                        return;
                    }

                    if (!existingUser) {
                        const { error: insertError } = await supabase
                            .from("users")
                            .insert([{ email, phone }]);

                        if (insertError) {
                            console.error("OTP Insert error:", insertError);
                            toast.error("Failed to create user");
                            return;
                        }
                    }

                    toast.success("OTP verified. Logged in!");
                    // Redirect or next step
                } else {
                    toast.error("Invalid OTP");
                }

                return; // Exit after OTP flow
            }

            // 🔐 CASE 2: Password Flow
            if (!password) {
                toast.error("Password is required if not using OTP");
                return;
            }

            const { data: existingUser, error: fetchError } = await supabase
                .from("users")
                .select("*")
                .eq("email", email)
                .single();

            if (fetchError && fetchError.code !== "PGRST116") {
                console.error("Fetch user error:", fetchError);
                toast.error("Error fetching user");
                return;
            }

            if (existingUser) {
                const isMatch = await bcrypt.compare(password, existingUser.password);

                if (isMatch) {
                    toast.success("Login successful");
                    // Redirect or further logic
                } else {
                    toast.error("Incorrect password");
                }
            } else {
                const hashedPassword = await bcrypt.hash(password, 10);

                const { error: insertError } = await supabase
                    .from("users")
                    .insert([{ email, password: hashedPassword, phone }]);

                if (insertError) {
                    console.error("Insert error:", insertError);
                    toast.error("Account creation failed");
                } else {
                    toast.success("Account created & logged in");
                    // Redirect or further logic
                }
            }
        } catch (err) {
            console.error("Login error:", err);
            toast.error("Unexpected error occurred");
        } finally {
            setLoading(false);
        }
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

                                <input
                                    type={"password"}
                                    placeholder="Enter your password (optional)"
                                    {...register("password")}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                                />

                                <button
                                    type="submit"
                                    disabled={(otp.length !== 6 && getValues("password")?.length < 6) || loading}
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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                />
                                <input
                                    type="text"
                                    placeholder="Enter your full name"
                                    {...register("fullname", { required: true })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                />
                                <input
                                    type="text"
                                    placeholder="Enter your phone"
                                    {...register("phone", { required: true })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                />
                                <input
                                    type="email"
                                    placeholder="Enter your official email"
                                    {...register("email", { required: true })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                                />

                                <button
                                    type="submit"
                                    className="w-full py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium rounded-md"
                                    disabled={loading}
                                >
                                    {loading ? "Sending..." : "Continue with Email"}
                                </button>
                            </>
                        )}
                    </form>

                    {/* {showOtpInput ? (
                        <div className="flex flex-col items-center gap-4">
                            <span className="text-black">Thank you!</span>
                            <span className="text-neutral-800 text-sm text-center">
                                We’ve sent an OTP to:
                                <p className="font-semibold">{email}</p>
                            </span>
                            <input
                                type="text"
                                placeholder="6-digit OTP"
                                maxLength={6}
                                value={otp}
                                onChange={handleOtpChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-[#15803D] text-black text-xl font-semibold tracking-wider"
                            />

                            <div className="flex items-center justify-center w-full mx-2">
                                <hr className="flex-grow border-gray-300" />
                                <span className="mx-3 text-gray-500">or</span>
                                <hr className="flex-grow border-gray-300" />
                            </div>

                            <div className="w-full relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#15803D] text-black text-sm font-semibold"
                                />
                                <button
                                    className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer text-gray-600"
                                    onClick={togglePasswordVisibility}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>


                            <button
                                onClick={proceedWithLogin}
                                disabled={(otp.length !== 6 && password.length < 6) || loading}
                                className="w-full py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 rounded-md transition text-sm font-semibold disabled:cursor-not-allowed"
                            >
                                {loading ? 'Verifying...' : 'Submit'}
                            </button>
                        </div>
                    ) : (
                        <>
                            <button onClick={signInWithGoogle} className="w-full">
                                <GoogleButton />
                            </button>

                            <div className="border-t border-gray-300" />

                            <input
                                type="text"
                                placeholder="Enter your phone"
                                value={phone}
                                max={10}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                                onChange={handlePhoneChange}
                            />

                            <input
                                type="email"
                                placeholder="Enter your official email"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <button
                                type="button"
                                disabled={!email}
                                onClick={onEmailLogin}
                                className="w-full py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium rounded-md disabled:cursor-not-allowed"
                            >
                                Continue with Email
                            </button>
                        </>
                    )} */}

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
