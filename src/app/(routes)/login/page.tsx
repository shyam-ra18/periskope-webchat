'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import "@/app/globals.css";
import GoogleButton from '@/shared/components/google-button';
import { supabase } from '@/services/supabaseClient';
import toast, { Toaster } from 'react-hot-toast';
import { sendOtpEmail } from '@/helpers/sendOtp';

const Login = () => {

    const [email, setEmail] = useState<string | null>(null);
    const [showOtpInput, setShowOtpInput] = useState<boolean>(false);
    const [otp, setOtp] = useState<string | null>(null);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Used to sign-in with google
    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
        });

        if (error) {
            toast.error(error.message);
            console.error('Error signing in with Google:', error);
        }
    };

    const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        // Allow only digits, up to length 6
        if (/^\d*$/.test(value) && value.length <= 6) {
            setOtp(value);
        }
        // else ignore input (don't update state)
    };

    const verifyOtp = async () => {
        try {
            const response = await fetch("/api/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });

            const data = await response.json();
            console.log(data);

            if (data.success) {
                toast.success("OTP verified successfully!");
            } else {
                toast.error("Invalid OTP");
            }
        } catch (error) {
            toast.error("Something went wrong");
            console.error(error);
        }
    };


    const onLogin = async () => {
        // if (email && emailRegex.test(email)) {
        try {
            const response = await fetch("/api/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            console.log(data);

            if (data.success) {
                setShowOtpInput(true);
                toast.success("OTP sent to your email!");
            } else {
                toast.error("Failed to send OTP");
            }
        } catch (error) {
            toast.error("Something went wrong");
            console.error(error);
        }
        // else {
        //     toast.error("Please enter a valid email address");
        // }
    };

    return (
        <div className="flex h-screen w-full">
            <Toaster />
            {/* Left side login content */}
            <section className="flex flex-1 flex-col justify-center items-center bg-white border-r border-gray-200 px-4">
                {/* Constrain all content inside one consistent width container */}
                <div className="w-xs space-y-6">
                    {/* Logo + Heading */}
                    <div className="flex flex-col items-center gap-4">
                        <Image
                            src="/assets/logo.svg"
                            alt="Logo of Periskope"
                            width={80}
                            height={80}
                        />
                        <h1 className="mt-2 text-xl font-semibold text-neutral-600 text-center">Log in to Periskope</h1>
                    </div>

                    {/* Google Button */}
                    {showOtpInput ? (
                        <div className="flex flex-col items-center gap-4">
                            <span className='text-black'>Thank you!</span>
                            <span className='text-neutral-800 text-sm'>We've sent an OTP for verification to <br />
                                <p className='text-neutral-800 font-semibold text-sm text-center'>{email || "shyam@gmail.com"}</p>

                            </span>
                            <input
                                type="text"
                                placeholder="6-digit OTP"
                                maxLength={6}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-[#15803D] transition duration-200 placeholder:text-neutral-500 placeholder:text-lg placeholder:font-semibold placeholder:tracking-wider text-black text-xl font-semibold tracking-wider "
                                onChange={handleOtpChange}
                            />
                        </div>
                    ) : (<button onClick={signInWithGoogle} className="w-full">
                        <GoogleButton />
                    </button>)}

                    <div className="border-t border-gray-300" />

                    {/* Email Input */}
                    <input
                        type="email"
                        placeholder="Enter your official email address"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-[#15803D] transition duration-200"
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    {/* Submit Button */}
                    <button
                        type="button"
                        onClick={showOtpInput ? verifyOtp : onLogin}
                        className="w-full py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium rounded-md transition duration-200"
                    >
                        Continue with Email
                    </button>

                    {/* Terms */}
                    <p className="text-center text-sm text-gray-500">
                        By signing up, you agree to Periskope's{' '}
                        <a href="/terms" className="text-neutral-600 underline hover:text-neutral-800">Terms of Service</a>{' '}
                        and{' '}
                        <a href="/privacy" className="text-neutral-600 underline hover:text-neutral-800">Privacy Policy</a>.
                    </p>
                </div>
            </section >


            {/* Right side with YouTube video */}
            <div className="hidden xl:flex flex-col justify-center items-center w-3/5 px-12 bg-gray-50 border-l border-gray-200 space-y-8" >
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

                <button
                    type="button"
                    className="py-2 px-4 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium rounded-md transition duration-200 shadow text-sm"
                >
                    Read Docs
                </button>
            </ div>
        </div >
    );
};

export default Login;
