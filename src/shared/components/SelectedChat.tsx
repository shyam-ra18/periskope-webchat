'use client'

import Link from 'next/link'
import React, { useState } from 'react'
import { IoIosSearch } from 'react-icons/io'
import { FaPaperclip, FaSmile, FaClock, FaRedo, FaMagic, FaMicrophone, FaPaperPlane, FaUser, FaPollH } from 'react-icons/fa';
import { BsCardText, BsEmojiSmile, BsStars } from 'react-icons/bs';
import Image from 'next/image';
import { IoMic, IoSend } from 'react-icons/io5';
import { ImAttachment } from 'react-icons/im';
import { GoClock } from 'react-icons/go';
import { PiClockClockwise } from 'react-icons/pi';
import { HiOutlineChevronUpDown } from 'react-icons/hi2';


const SelectedChat = () => {
    const [message, setMessage] = useState('');
    return (
        <div className="flex-1 w-2xl mx-auto border-r border-gray-300 relative bg-white h-full chatBg ml-0">
            {/* top bar */}
            <div className="w-full bg-white h-12 px-2.5 border-b border-gray-200 flex items-center justify-between ">

                <div className='flex items-center gap-2'>
                    <div className="bg-gray-300 rounded-full h-8 w-8 flex items-center justify-center text-sm font-bold">
                        <FaUser size={16} className='text-[#fafafa]' />
                    </div>
                    <div className='flex flex-col items-start'>
                        <p className='text-sm font-semibold text-black'>Priyank Vyas</p>
                        <p className='text-xs text-gray-500' >+91 9327384238</p>
                    </div>
                </div>

                {/* plan upgrade & menus */}
                <div className="flex items-center gap-3 px-2">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center bg-green-500 w-6 h-6 rounded-full text-white text-xs">
                            A
                        </div>
                    </div>

                    <div className="flex items-center">
                        <BsStars size={18} className='text-black/80' />
                    </div>

                    <div className="flex items-center">
                        <IoIosSearch size={20} className='text-black/80' />
                    </div>


                    {/* <div className="relative group">
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
                        </div> */}


                </div>
            </div>

            <section className="w-full bg-white border-t border-gray-300 px-4 py-2 absolute bottom-10 left-0">
                <div className="flex items-center gap-2">
                    {/* Textarea (replaces input) */}
                    <textarea
                        rows={1}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Message..."
                        className="flex-1 resize-none overflow-hidden p-2 text-sm outline-none border-none bg-white min-h-[36px] max-h-[150px] placeholder:text-gray-500 text-neutral-800 font-[500]"
                        onInput={(e) => {
                            e.currentTarget.style.height = 'auto';
                            e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                        }}
                    />

                    <button className="hover:border hover:border-gray-200 text-white rounded-md transition text-xs font-semibold flex justify-between items-center px-4 py-1.5 gap-1 cursor-pointer">
                        <IoSend size={22} className="text-[#15803D]" />
                    </button>
                </div>

                <div className="flex items-end justify-between gap-2 mt-2">
                    <div className="flex-1 flex items-end gap-2">
                        {/* Icons with non-blocking tooltip */}
                        <div className="flex items-center gap-3">
                            {[
                                { icon: <ImAttachment size={16} />, label: 'Attach File' },
                                { icon: <BsEmojiSmile size={16} />, label: 'Insert Emoji' },
                                { icon: <GoClock size={17} />, label: 'Schedule Message' },
                                { icon: <PiClockClockwise size={18} />, label: 'Resend Later' },
                                { icon: <BsStars size={18} />, label: 'Magic Suggest' },
                                { icon: <FaPollH size={17} />, label: 'Create Poll' },
                                { icon: <IoMic size={18} />, label: 'Voice Message' },
                            ].map(({ icon, label }, i) => (
                                <div key={i} className="relative group">
                                    <button
                                        className="p-2 rounded hover:bg-gray-100 text-neutral-800 transition-colors"
                                        aria-label={label}
                                    >
                                        {icon}
                                    </button>
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-white text-gray-800 border border-gray-200 px-2 py-1 rounded z-10 whitespace-nowrap pointer-events-none">
                                        {label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Section: Profile Selector */}
                    <div className="flex items-end gap-2">
                        <div className="flex items-center border border-gray-300 hover:bg-gray-100 cursor-pointer rounded-md px-2 py-1 text-sm gap-2">
                            <Image
                                src="/assets/logo.svg"
                                alt="User"
                                width={20}
                                height={20}
                                className="rounded-full border border-gray-200"
                            />
                            <span className="font-semibold text-xs">Shyam Radadiya</span>
                            <HiOutlineChevronUpDown size={14} className="text-gray-800" />
                        </div>
                    </div>
                </div>
            </section>

        </div>
    )
}

export default SelectedChat