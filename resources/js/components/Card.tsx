import type { HTMLAttributes, ReactNode } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    className?: string;
}

export default function Card({ children, className = '', ...rest }: Props) {
    return (
        <div
            className={`rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md ${className}`}
            {...rest}
        >
            {children}
        </div>
    );
}
