import { Head, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import AdminHeader from '../components/Admin/AdminHeader';
import AdminSidebar from '../components/Admin/AdminSidebar';
import FlashMessages from '../components/Admin/FlashMessages';
import SkipLink from '../components/SkipLink';
import { useFavicon } from '../hooks/useFavicon';
import type { AdminUser, PageProps } from '../types';

interface Props {
    children: ReactNode;
    title: string;
}

function UserMenu({ user }: { user: AdminUser }) {
    return (
        <div className="space-y-1 text-sm">
            <p className="font-medium text-slate-900">{user.name ?? user.email}</p>
            <p className="text-slate-500">{user.email}</p>
        </div>
    );
}

export default function AdminLayout({ children, title }: Props) {
    const { props } = usePage<PageProps>();
    const [menuOpen, setMenuOpen] = useState(false);

    useFavicon(props.branding.favicon_path);

    useEffect(() => {
        if (!menuOpen) {
            return;
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setMenuOpen(false);
            }
        };

        document.addEventListener('keydown', onKeyDown);

        return () => document.removeEventListener('keydown', onKeyDown);
    }, [menuOpen]);

    return (
        <>
            <Head title={`${title} — Admin`} />
            <SkipLink />

            <div className="flex min-h-screen bg-slate-50">
                <div className="hidden lg:block">
                    <AdminSidebar>{props.auth.user && <UserMenu user={props.auth.user} />}</AdminSidebar>
                </div>

                {menuOpen && (
                    <div
                        id="admin-mobile-menu"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Admin navigation"
                        className="fixed inset-0 z-30 lg:hidden"
                    >
                        <div
                            className="absolute inset-0 bg-slate-900/25"
                            onClick={() => setMenuOpen(false)}
                            aria-hidden="true"
                        />
                        <div className="absolute left-0 top-0 h-full w-64">
                            <AdminSidebar onNavClick={() => setMenuOpen(false)}>
                                {props.auth.user && <UserMenu user={props.auth.user} />}
                            </AdminSidebar>
                        </div>
                    </div>
                )}

                <div className="flex min-w-0 flex-1 flex-col">
                    <AdminHeader title={title} onMenuToggle={() => setMenuOpen((open) => !open)} menuOpen={menuOpen} />

                    <main id="main-content" className="flex-1 focus:outline-none" tabIndex={-1}>
                        <FlashMessages />
                        <div className="p-4 lg:p-6">{children}</div>
                    </main>
                </div>
            </div>
        </>
    );
}
