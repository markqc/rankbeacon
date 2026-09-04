import type { TextareaHTMLAttributes } from 'react';

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: boolean;
}

export default function Textarea({ className = '', error, ...props }: Props) {
    const base =
        'block min-h-24 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
    const errorClass = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '';

    return <textarea className={`${base} ${errorClass} ${className}`} aria-invalid={error || undefined} {...props} />;
}
