import type { ReactNode } from 'react';

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

interface Props {
    tone?: Tone;
    children: ReactNode;
    className?: string;
}

export default function Badge({ tone = 'neutral', className = '', children }: Props) {
    const styles: Record<Tone, string> = {
        neutral: 'bg-slate-100 text-slate-700',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-amber-100 text-amber-800',
        danger: 'bg-red-100 text-red-800',
        info: 'bg-blue-100 text-blue-800',
    };

    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[tone]} ${className}`}
        >
            {children}
        </span>
    );
}
