import { Link, usePage } from '@inertiajs/react';
import type { PageProps } from '../types';
import { currentYear } from '../utils/footerYear';
import Container from './Container';

export default function Footer() {
    const { branding } = usePage<PageProps>().props;
    const year = currentYear();

    const links = [
        { href: '/', label: 'Home' },
        { href: '/tools', label: 'Tools' },
        { href: '/guides', label: 'Guides' },
        { href: '/about', label: 'About' },
        { href: '/privacy', label: 'Privacy' },
        { href: '/terms', label: 'Terms' },
    ];

    return (
        <footer className="border-t border-slate-200 bg-slate-50 text-sm text-slate-600">
            <Container>
                <div className="flex flex-col gap-6 py-8 md:flex-row md:items-start md:justify-between">
                    <div>
                        <p className="font-semibold text-navy-950">{branding.site_name}</p>
                        <p>{branding.tagline}</p>
                    </div>
                    <nav aria-label="Footer">
                        <ul className="flex flex-wrap gap-4">
                            {links.map(({ href, label }) => (
                                <li key={href}>
                                    <Link href={href} className="hover:text-navy-950 hover:underline">
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
                <div className="border-t border-slate-200 py-4 text-xs">
                    <p>© {year} Authority Lighthouse. Platform developed by MCaneda.com.</p>
                </div>
            </Container>
        </footer>
    );
}
