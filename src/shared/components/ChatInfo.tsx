import React from 'react'
import { BsStars } from 'react-icons/bs'
import { FaUser } from 'react-icons/fa'
import { FiEdit3 } from 'react-icons/fi'
import { GoPlus } from 'react-icons/go'
import { IoIosSearch } from 'react-icons/io'
import { IoSync } from 'react-icons/io5'
import { TbLayoutSidebarRightCollapseFilled } from 'react-icons/tb'

const ChatInfo = () => {
    return (
        <div className="flex-1  mx-auto border-r border-gray-300 relative bg-white h-full">
            {/* top bar */}
            <div className="w-full bg-white p-3 border-b border-gray-200 flex items-center justify-between ">

                <div className="flex items-start gap-3 w-full flex-wrap md:flex-nowrap">
                    {/* Avatar */}
                    <div className="bg-gray-300 rounded-full h-10 w-10 flex items-center justify-center text-sm font-bold shrink-0">
                        <FaUser size={18} className="text-white" />
                    </div>

                    {/* User Info & Actions */}
                    <div className="flex flex-col w-full">
                        {/* Name */}
                        <p className="text-sm font-semibold text-black">Priyank Vyas</p>

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


                {/* plan upgrade & menus */}
                {/* <div className="flex items-center gap-3 px-2">
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
                </div> */}
            </div>
        </div>
    )
}

export default ChatInfo