import { Link, usePage } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';

interface Props {
    href: string;
    label: string;
    icon: LucideIcon;
    onClick?: () => void;
}

export default function AdminNavItem({ href, label, icon: Icon, onClick }: Props) {
    const { url } = usePage();
    const currentPath = url.split('?')[0];
    const isActive = currentPath === href || currentPath.startsWith(`${href}/`);

    return (
        <Link
            href={href}
            onClick={onClick}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive ? 'bg-teal-100 text-teal-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            aria-current={isActive ? 'page' : undefined}
        >
            <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
            {label}
        </Link>
    );
}
