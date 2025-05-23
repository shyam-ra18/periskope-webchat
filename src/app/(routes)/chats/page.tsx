"use client";

import ChatBox from "@/shared/components/ChatBox";
import ChatInfo from "@/shared/components/ChatInfo";
import LeftMenuBar from "@/shared/components/LeftMenuBar";
import SelectedChat from "@/shared/components/SelectedChat";
import { useUserStore } from "@/store/useUserStore";
import Link from "next/link";
import React from "react";
import { AiFillThunderbolt, AiOutlineQuestionCircle } from "react-icons/ai";
import { BsChatDotsFill, BsListTask } from "react-icons/bs";
import { HiCursorClick } from "react-icons/hi";
import { HiOutlineChevronUpDown } from "react-icons/hi2";
import { IoMdNotificationsOff } from "react-icons/io";
import { IoLockClosedOutline } from "react-icons/io5";
import { LuRefreshCcwDot } from "react-icons/lu";
import { MdInstallDesktop } from "react-icons/md";

export default function Chats({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = useUserStore((state) => state.user)

    return (
        <div className="h-screen flex flex-col bg-background overflow-hidden">
            {/* Left sidebar */}
            <LeftMenuBar />

            {/* top bar */}
            <div className="w-full bg-white px-4 py-3 border-b border-gray-200 pl-16 flex items-center justify-between ">

                <div className="flex items-center gap-2 ml-4">
                    <BsChatDotsFill size={15} className=" text-gray-500" />
                    <p className="text-gray-500 text-sm font-semibold" >Chats</p>
                </div>

                {/* plan upgrade & menus */}
                <div className="flex items-center gap-2">

                    <div className="flex items-center gap-2">
                        <div className="flex flex-col items-start">
                            <span className="text-red-600 text-xs p-0 m-0 font-semibold">7 days left in your trial</span>
                            <Link href="/" className="text-blue-500 text-xs p-0 m-0 underline">Request an extension</Link>
                        </div>

                        <button
                            className="bg-[#15803D] text-white text-xs font-semibold px-3 py-2 rounded flex items-center gap-1 cursor-pointer"
                        >
                            <AiFillThunderbolt size={14} className=" text-white" />
                            Upgrade Plan
                        </button>

                        <button
                            className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 rounded-md transition text-xs font-semibold flex justify-between items-center px-4 py-2 gap-1 cursor-pointer"
                        >
                            <LuRefreshCcwDot size={14} className=" text-gray-800" />
                            Refresh
                        </button>

                        <button
                            className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 rounded-md transition text-xs font-semibold flex justify-between items-center px-4 py-2 gap-1 cursor-pointer"
                        >
                            <AiOutlineQuestionCircle size={14} className=" text-gray-800" />
                            Help
                        </button>

                        <button
                            className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 rounded-md transition text-xs font-semibold flex justify-between items-center px-4 py-2 gap-1 cursor-pointer"
                        >
                            <span className="bg-[#15803D] w-2 h-2 rounded-full shadow shadow-[#15803D] " />
                            1/1 phones
                            <HiOutlineChevronUpDown size={14} className=" text-gray-800" />
                        </button>

                        <div className="relative group">
                            <button
                                className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 rounded-md transition text-xs font-semibold flex justify-between items-center px-4 py-1.5 gap-1 cursor-pointer"
                            >
                                <MdInstallDesktop size={18} className="text-gray-800" />
                            </button>

                            <span
                                className="absolute top-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 rounded bg-white border border-neutral-200 text-xs text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap mt-1"
                            >
                                Install periskope on your desktop
                            </span>
                        </div>

                        <div className="relative group">
                            <button
                                className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 rounded-md transition text-xs font-semibold flex justify-between items-center px-4 py-1.5 gap-1 cursor-pointer"
                            >
                                <IoMdNotificationsOff size={18} className=" text-gray-800" />
                            </button>

                            <span
                                className="absolute top-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 rounded bg-white border border-neutral-200 text-xs text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap mt-1"
                            >
                                Enable Notifications
                            </span>
                        </div>

                        <div className="relative group">
                            <button
                                className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 rounded-md transition text-xs font-semibold flex justify-between items-center px-4 py-1.5 gap-1 cursor-pointer"
                            >
                                <BsListTask size={18} className=" text-gray-800" />

                            </button>
                            <span
                                className="absolute top-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 rounded bg-white border border-neutral-200 text-xs text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap mt-1"
                            >
                                Tasks
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* chat box */}
            <div className=" flex items-center ">
                <div className="h-full self-start pl-16">
                    <ChatBox />
                </div>

                {user == null ? (
                    <div className="w-full h-full flex items-center justify-center bg-[#F9FAFB]">
                        <div className="flex flex-col items-center gap-1">
                            <HiCursorClick size={18} className="text-gray-400" />
                            <span className="text-gray-400 text-xs font-normal">Select a chat to view</span>
                            <span className="text-gray-400 text-xs font-medium hover:text-[#15803D] underline transition-all duration-200 mt-1 cursor-pointer">Can't see all data? Click to refresh</span>
                        </div>

                        <div className="flex flex-row items-center gap-1 absolute bottom-6">
                            <IoLockClosedOutline size={14} className="text-gray-400" />
                            <span className="text-gray-400 text-xs font-normal">Secure viewer</span>
                        </div>

                    </div>)
                    :
                    (
                        <>
                            {/* Selected Chat */}
                            <div className="h-full w-full self-start">
                                <SelectedChat />
                            </div>

                            {/* chat info */}
                            <div className="h-full w-full self-start">
                                <ChatInfo user={user} />
                            </div>
                        </>
                    )
                }

            </div>
        </div>
    );
}