'use client'

import { useUserStore } from '@/store/useUserStore'
import React, { useState } from 'react'
import { BsStars } from 'react-icons/bs'
import { FaCaretDown, FaUser, FaVideo } from 'react-icons/fa'
import { FiEdit3 } from 'react-icons/fi'
import { GoPlus, GoTasklist } from 'react-icons/go'
import { ImTicket } from 'react-icons/im'
import { IoIosSearch } from 'react-icons/io'
import { IoSync } from 'react-icons/io5'
import { MdGroups, MdPermMedia } from 'react-icons/md'
import { RiListSettingsLine, RiMenu3Fill } from 'react-icons/ri'
import { TbLayoutSidebarRightCollapseFilled, TbMessageReport, TbSubtask } from 'react-icons/tb'

const ChatInfo = ({ user }: { user: any }) => {
    const [activeIndex, setActiveIndex] = useState(0)

    const items = [
        { icon: <RiMenu3Fill size={20} />, label: 'Overview' },
        { icon: <GoTasklist size={20} />, label: 'Properties' },
        { icon: <TbSubtask size={20} />, label: 'Integrations' },
        { icon: <MdGroups size={20} />, label: 'Members' },
        { icon: <MdPermMedia size={20} />, label: 'Media' },
        { icon: <RiListSettingsLine size={20} />, label: 'Settings' },
    ]


    return (
        <div className="flex-1  mx-auto border-r border-gray-300 relative bg-white h-full">
            {/* top bar */}
            <div className="w-full bg-white p-3 pb-0 border-b border-gray-200 flex flex-col items-center justify-between ">

                <div className="flex items-start gap-3 w-full flex-wrap md:flex-nowrap">
                    {/* Avatar */}
                    <div className="bg-gray-300 rounded-full h-10 w-10 flex items-center justify-center text-sm font-bold shrink-0">
                        <FaUser size={18} className="text-white" />
                    </div>

                    {/* User Info & Actions */}
                    <div className="flex flex-col w-full">
                        {/* Name */}
                        <p className="text-sm font-semibold text-black">{user?.full_name}</p>

                        {/* Label and Icons Row */}
                        <div className="flex justify-between items-center w-full mt-1 flex-wrap gap-2">

                            {/* Label */}
                            <div className="flex items-center gap-1 border border-dashed border-gray-400 rounded px-2 py-1 text-gray-500 hover:bg-gray-50 text-xs cursor-pointer">
                                <GoPlus size={12} />
                                <span>Label</span>
                            </div>

                            {/* Icons */}
                            <div className="flex items-center gap-2">
                                <button className="bg-gray-300 rounded-full p-1 hover:bg-gray-400 transition">
                                    <FaUser size={12} className="text-white" />
                                </button>
                                <button className="rounded-full transition">
                                    <FiEdit3 size={16} className="text-gray-500 hover:text-gray-800" />
                                </button>
                                <button className="rounded-full transition">
                                    <IoSync size={16} className="text-gray-500 hover:text-gray-800" />
                                </button>
                                <button className="rounded-full transition">
                                    <TbLayoutSidebarRightCollapseFilled size={16} className="text-gray-500 hover:text-gray-800" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* optiosn */}
                <div className="flex flex-row justify-evenly items-center gap-2 w-full bg-white mt-4">
                    {items.map((item, index) => {
                        const isActive = index == activeIndex
                        return (
                            <button
                                key={index}
                                onClick={() => setActiveIndex(index)}
                                className={`flex items-center gap-2 cursor-pointer transition-all duration-150 pb-1.5
                                ${isActive ? ' text-[#15803D] border-b-2 border-[#15803D]' : 'justify-center text-gray-600'}
                                `}
                            >
                                {item.icon}
                                {isActive && <span className="text-sm font-medium">{item.label}</span>}
                            </button>
                        )
                    })}
                </div>

            </div>

            <div className="w-full h-full flex-col">

                <div className='flex-col justify-center items-center'>
                    <div className='flex items-center gap-2 p-2'>
                        <FaCaretDown size={16} className='text-gray-500' />
                        <span className='text-xs font-medium text-gray-500'>Open Tickets</span>
                    </div>
                    <div className='flex flex-col items-center justify-center mt-2 gap-1'>
                        <ImTicket size={16} className='text-gray-400' />
                        <span className='text-xs text-gray-400'>No open tickets</span>
                        <span className='text-xs text-gray-400 px-14 text-center'>To create a ticket, right-click on any message, or use the 🏷️ emoji
                        </span>
                        <button className="py-2 px-4 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium rounded-md text-xs flex items-center gap-2 mt-1 shadow cursor-pointer">
                            <FaVideo />
                            Watch Tutorial
                        </button>
                    </div>
                </div>

                <hr className='w-full border-gray-300 mt-4' />

                <div className='flex-col justify-center items-center'>
                    <div className='flex items-center gap-2 p-2'>
                        <FaCaretDown size={16} className='text-gray-500' />
                        <span className='text-xs font-medium text-gray-500'>Open Flagged Messages</span>
                    </div>
                    <div className='flex flex-col items-center justify-center mt-2 gap-1'>
                        <TbMessageReport size={16} className='text-gray-400' />
                        <span className='text-xs text-gray-400'>No open flagged messages</span>
                        <span className='text-xs text-gray-400 px-14 text-center'>Important messages will be flagged here automatically by an AI.
                        </span>
                        <button className="py-2 px-4 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium rounded-md text-xs flex items-center gap-2 mt-1 shadow cursor-pointer">
                            <FaVideo />
                            Watch Tutorial
                        </button>
                    </div>
                </div>

                <hr className='w-full border-gray-300 mt-4' />

                <div className='flex-col justify-center items-center'>
                    <div className='flex items-center gap-2 p-2'>
                        <FaCaretDown size={16} className='text-gray-500' />
                        <span className='text-xs font-medium text-gray-500'>Open Tasks</span>
                    </div>
                    <div className='flex flex-col items-center justify-center mt-2 gap-1'>
                        <TbMessageReport size={16} className='text-gray-400' />
                        <span className='text-xs text-gray-400'>No open tasks</span>
                        <span className='text-xs text-gray-400 px-14 text-center'>To create a task, click on the top right menu button and create the required task ➕.
                        </span>
                        <button className="py-2 px-4 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium rounded-md text-xs flex items-center gap-2 mt-1 shadow cursor-pointer">
                            <FaVideo />
                            Watch Tutorial
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChatInfo