import type { ReactNode } from 'react';

interface Props {
    label: string;
    htmlFor?: string;
    error?: string;
    hint?: string;
    required?: boolean;
    hideLabel?: boolean;
    className?: string;
    children: ReactNode;
}

export default function FormField({
    label,
    htmlFor,
    error,
    hint,
    required,
    hideLabel = false,
    className = '',
    children,
}: Props) {
    const errorId = `${htmlFor}-error`;
    const hintId = `${htmlFor}-hint`;

    return (
        <div className={`space-y-1.5 ${className}`}>
            {!hideLabel && (
                <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700">
                    {label}
                    {required && <span aria-hidden="true"> *</span>}
                </label>
            )}
            {hint && (
                <p className="text-xs text-slate-500" id={hintId}>
                    {hint}
                </p>
            )}
            {children}
            {error && (
                <p className="text-sm text-red-600" id={errorId}>
                    {error}
                </p>
            )}
        </div>
    );
}
