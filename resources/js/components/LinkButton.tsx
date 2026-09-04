import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface Props {
    href: string;
    variant?: Variant;
    size?: Size;
    children: ReactNode;
    className?: string;
    onClick?: () => void;
}

export default function LinkButton({
    href,
    variant = 'primary',
    size = 'md',
    className = '',
    children,
    onClick,
}: Props) {
    const base =
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2';

    const variants: Record<Variant, string> = {
        primary: 'bg-teal-500 text-white hover:bg-teal-600',
        secondary: 'bg-navy-950 text-white hover:bg-navy-900',
        outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
        ghost: 'text-slate-700 hover:bg-slate-100',
    };

    const sizes: Record<Size, string> = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    return (
        <Link className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} href={href} onClick={onClick}>
            {children}
        </Link>
    );
}
