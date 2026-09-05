import { usePage } from '@inertiajs/react';
import { BarChart3, LayoutDashboard, ScrollText, Settings, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import type { PageProps } from '../../types';
import Lighthouse from '../icons/Lighthouse';
import AdminNavItem from './AdminNavItem';

interface Props {
    onNavClick?: () => void;
    children?: ReactNode;
}

const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
    { href: '/admin/activity-logs', label: 'Activity Logs', icon: ScrollText },
];

export default function AdminSidebar({ onNavClick, children }: Props) {
    const { branding } = usePage<PageProps>().props;

    return (
        <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-white">
            <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
                <Lighthouse className="h-8 w-8" />
                <div className="flex flex-col">
                    <span className="font-semibold text-navy-950">{branding.site_name}</span>
                    <span className="text-xs text-slate-500">Admin</span>
                </div>
            </div>

            <nav aria-label="Admin" className="flex-1 overflow-y-auto p-4">
                <ul className="space-y-1">
                    {navItems.map(({ href, label, icon }) => (
                        <li key={href}>
                            <AdminNavItem href={href} label={label} icon={icon} onClick={onNavClick} />
                        </li>
                    ))}
                </ul>
            </nav>

            {children && <div className="border-t border-slate-200 p-4">{children}</div>}
        </aside>
    );
}
