import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import type { ReactNode } from 'react';

type Variant = 'info' | 'success' | 'warning' | 'danger';

interface Props {
    variant?: Variant;
    title?: string;
    children: ReactNode;
    className?: string;
}

export default function Alert({ variant = 'info', title, children, className = '' }: Props) {
    const icons: Record<Variant, typeof Info> = {
        info: Info,
        success: CheckCircle,
        warning: AlertTriangle,
        danger: AlertCircle,
    };

    const styles: Record<Variant, string> = {
        info: 'bg-blue-100 text-blue-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-amber-100 text-amber-800',
        danger: 'bg-red-100 text-red-800',
    };

    const Icon = icons[variant];

    return (
        <div className={`flex gap-3 rounded-lg border p-4 ${styles[variant]} ${className}`} role="alert">
            <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
            <div>
                {title && <p className="font-semibold">{title}</p>}
                <div className="text-sm">{children}</div>
            </div>
        </div>
    );
}
