'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { BsGearFill } from 'react-icons/bs';
import { FaHome } from 'react-icons/fa';
import { GoGraph } from 'react-icons/go';
import { IoChatbubbleEllipsesSharp, IoList, IoTicket } from 'react-icons/io5';
import { MdOutlineChecklist, MdPermMedia } from 'react-icons/md';
import { PiShareFill, PiTreeView } from 'react-icons/pi';
import { RiContactsBookFill } from 'react-icons/ri';
import { TbLayoutSidebarLeftCollapse, TbStarsFilled } from 'react-icons/tb';

const menuItems = [
    { href: '/dashboard', icon: <FaHome size={20} />, label: 'Dashboard', desc: 'Overall Summary of state on periskope' },
    { href: '/chats', icon: <IoChatbubbleEllipsesSharp size={20} />, label: 'Chats', desc: "View all your Whatsapp chats" },
    { href: '/tickets', icon: <IoTicket size={20} />, label: 'Tickets', desc: "Manage all your tickets" },
    { href: '/analytics', icon: <GoGraph size={20} />, label: 'Analytics', desc: "View all your whatsapp analytics" },
    { href: '/list', icon: <IoList size={20} />, label: 'Chat List', desc: "View all your whatsapp list, group and contacts, broadcast messages and more" },
    { href: '/bulk', icon: <PiShareFill size={20} />, label: 'Bulk Message', desc: "Send bulk messages to your contacts" },
    { href: '/automation', icon: <PiTreeView size={20} />, label: 'Automation Rules ✨', desc: "Create and manage your automation rules" },
    { href: '/contacts', icon: <RiContactsBookFill size={20} />, label: 'Contacts', desc: "View all your contacts" },
    { href: '/media', icon: <MdPermMedia size={20} />, label: 'Media', desc: "View all your media" },
    { href: '/logs', icon: <MdOutlineChecklist size={20} />, label: 'Logs', desc: "View all your logs" },
    { href: '/settings', icon: <BsGearFill size={20} />, label: 'Settings', desc: "View all your settings" },
];

const LeftMenuBar = () => {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(true);

    return (
        <aside
            className={`${collapsed ? 'w-16' : 'w-60'}
        transition-all duration-300 bg-white h-screen border-r border-gray-200
        flex flex-col fixed top-0 left-0 min-h-screen z-20`}>
            <div className="flex flex-col flex-grow pt-3 overflow-y-auto scrollbar-thin overflow-visible relative">
                <div className="flex items-center justify-center self-center h-7 w-7 rounded-sm bg-[#15803D] text-white text-sm font-bold mb-6">
                    S
                </div>
                <nav className="flex-1 px-1 flex-col justify-start items-start">
                    {menuItems.map(({ href, icon, label, desc }) => {
                        const isActive = pathname.startsWith(href);
                        return (
                            <Link
                                key={label}
                                href={href}
                                className={`group relative flex ${collapsed ? 'justify-center px-2' : 'justify-start px-4 z-0'} items-center gap-3 rounded-md py-2.5 hover:bg-gray-100 ${isActive ? 'text-[#15803D] font-semibold' : 'text-gray-600'}`}
                            >
                                <div className="text-lg">{icon}</div>
                                {!collapsed && <span className="text-md font-medium">{label}</span>}
                                {collapsed && (
                                    <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity z-30 pointer-events-none">
                                        {label}
                                        <span className="block text-xs text-gray-300">{desc}</span>
                                    </span>
                                )}
                            </Link>

                        );
                    })}
                </nav>

                {/* Bottom Panel */}
                <div className={`p-4 flex flex-col ${collapsed ? 'justify-center items-center' : ' items-start'}  px-4 gap-3`}>
                    {/* Avatar & Email */}
                    <div className={`flex items-center space-x-2 ${collapsed ? 'justify-center' : ''}`}>
                        <div className="flex items-center justify-center bg-green-500 w-5 h-5 rounded-full text-white text-xs">
                            A
                        </div>
                        {!collapsed && (
                            <div className="text-xs text-gray-500">admin@gmail.com</div>
                        )}
                    </div>

                    {/* What's New */}
                    <div className="group relative flex items-center rounded cursor-pointer">
                        <TbStarsFilled size={20} />
                        {!collapsed && <span className="ml-2 text-sm">What's New</span>}
                        {collapsed && (
                            <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                What's New
                            </span>
                        )}
                    </div>

                    {/* Collapse Button */}
                    <button
                        className="group relative flex items-center rounded "
                        onClick={() => setCollapsed(!collapsed)}
                    >
                        <TbLayoutSidebarLeftCollapse size={22} />
                        {!collapsed && <span className="ml-2 text-sm">Collapse</span>}
                        {collapsed && (
                            <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                Collapse
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default LeftMenuBar;
