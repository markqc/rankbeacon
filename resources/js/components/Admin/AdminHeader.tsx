import { Link, usePage } from '@inertiajs/react';
import { LogOut, Menu, UserCircle, UserRound, X } from 'lucide-react';
import { useState } from 'react';
import type { AdminUser, PageProps } from '../../types';
import Lighthouse from '../../components/icons/Lighthouse';

interface Props {
    title: string;
    onMenuToggle: () => void;
    menuOpen: boolean;
}

function userDisplayName(user: AdminUser): string {
    return user.name ?? user.email;
}

function userRole(user: AdminUser): string {
    const first = user.roles[0];

    if (first) {
        return first.label ?? first.name ?? 'User';
    }

    return 'User';
}

export default function AdminHeader({ title, onMenuToggle, menuOpen }: Props) {
    const { props } = usePage<PageProps>();
    const user = props.auth.user as AdminUser | null;
    const siteName = props.branding.site_name;
    const [profileOpen, setProfileOpen] = useState(false);

    return (
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
            <div className="flex items-center justify-between px-4 py-3 lg:px-6">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={onMenuToggle}
                        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
                        aria-controls="admin-mobile-menu"
                        aria-expanded={menuOpen}
                        aria-label="Toggle admin navigation"
                    >
                        {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                    <div className="flex items-center gap-2 lg:hidden">
                        <Lighthouse className="h-7 w-7" />
                        <span className="font-semibold text-navy-950">{siteName}</span>
                    </div>
                    <h1 className="hidden text-lg font-semibold text-slate-900 lg:block">{title}</h1>
                </div>

                {user && (
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setProfileOpen((open) => !open)}
                            className="flex items-center gap-2 rounded-lg p-2 text-sm text-slate-700 hover:bg-slate-100"
                            aria-expanded={profileOpen}
                            aria-haspopup="menu"
                            aria-label={`Account menu for ${userDisplayName(user)}`}
                        >
                            {user.avatar_path ? (
                                <img
                                    src={user.avatar_path}
                                    alt=""
                                    className="h-7 w-7 rounded-full border border-slate-200 object-cover"
                                />
                            ) : (
                                <UserCircle className="h-5 w-5 text-slate-500" aria-hidden="true" />
                            )}
                            <span className="hidden sm:inline">{userDisplayName(user)}</span>
                        </button>

                        {profileOpen && (
                            <div
                                className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-200 bg-white py-2 shadow-lg"
                                role="menu"
                            >
                                <div className="border-b border-slate-100 px-4 py-2">
                                    <p className="font-medium text-slate-900">{userDisplayName(user)}</p>
                                    <p className="text-xs text-slate-500">{user.email}</p>
                                    <p className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                                        {userRole(user)}
                                    </p>
                                </div>
                                <Link
                                    href="/admin/profile"
                                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                                    role="menuitem"
                                    onClick={() => setProfileOpen(false)}
                                >
                                    <UserRound className="h-4 w-4" aria-hidden="true" />
                                    Profile
                                </Link>
                                <Link
                                    href="/admin/logout"
                                    method="post"
                                    as="button"
                                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                                    role="menuitem"
                                >
                                    <LogOut className="h-4 w-4" aria-hidden="true" />
                                    Log out
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}
