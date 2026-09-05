import { Link } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import LinkButton from './LinkButton';
import Lighthouse from './icons/Lighthouse';

interface Props {
    currentUrl: string;
    siteName: string;
    tagline: string;
}

interface NavItem {
    href: string;
    label: string;
}

const navItems: NavItem[] = [
    { href: '/', label: 'Home' },
    { href: '/tools', label: 'Tools' },
    { href: '/guides', label: 'Guides' },
    { href: '/about', label: 'About' },
];

function isActive(currentUrl: string, href: string): boolean {
    return currentUrl === href || currentUrl.startsWith(`${href}/`);
}

export default function Header({ currentUrl, siteName, tagline }: Props) {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-2 rounded-lg">
                    <Lighthouse className="h-8 w-8" />
                    <div className="flex flex-col">
                        <span className="text-xl font-bold text-navy-950">{siteName}</span>
                        <span className="hidden text-xs text-slate-500 sm:block">{tagline}</span>
                    </div>
                </Link>

                <div className="hidden items-center gap-6 md:flex">
                    <nav aria-label="Primary" className="flex gap-6 text-sm font-medium text-slate-700">
                        {navItems.map(({ href, label }) => (
                            <Link
                                key={href}
                                href={href}
                                className={`transition-colors hover:text-navy-950 ${
                                    isActive(currentUrl, href) ? 'text-navy-950' : ''
                                }`}
                                aria-current={isActive(currentUrl, href) ? 'page' : undefined}
                            >
                                {label}
                            </Link>
                        ))}
                    </nav>
                    <LinkButton href="/tools/serp-preview" size="sm">
                        Explore Tools
                    </LinkButton>
                </div>

                <button
                    type="button"
                    className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden"
                    aria-controls="mobile-menu"
                    aria-expanded={menuOpen}
                    aria-label="Toggle navigation"
                    onClick={() => setMenuOpen((open) => !open)}
                >
                    {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {menuOpen && (
                <nav id="mobile-menu" aria-label="Mobile" className="border-t border-slate-200 px-4 py-4 md:hidden">
                    <ul className="space-y-3">
                        {navItems.map(({ href, label }) => (
                            <li key={href}>
                                <Link
                                    href={href}
                                    className={`block text-sm font-medium ${
                                        isActive(currentUrl, href) ? 'text-navy-950' : 'text-slate-700'
                                    }`}
                                    aria-current={isActive(currentUrl, href) ? 'page' : undefined}
                                    onClick={() => setMenuOpen(false)}
                                >
                                    {label}
                                </Link>
                            </li>
                        ))}
                        <li>
                            <LinkButton
                                href="/tools/serp-preview"
                                size="sm"
                                className="w-full"
                                onClick={() => setMenuOpen(false)}
                            >
                                Explore Tools
                            </LinkButton>
                        </li>
                    </ul>
                </nav>
            )}
        </header>
    );
}
