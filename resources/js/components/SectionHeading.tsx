import type { ReactNode } from 'react';

interface Props {
    title: string;
    subtitle?: ReactNode;
    as?: 'h1' | 'h2' | 'h3';
}

export default function SectionHeading({ title, subtitle, as: Tag = 'h2' }: Props) {
    return (
        <div className="mb-8 max-w-3xl">
            <Tag className="text-3xl font-bold text-navy-950 sm:text-4xl">{title}</Tag>
            {subtitle && <p className="mt-2 text-lg text-slate-600">{subtitle}</p>}
        </div>
    );
}
