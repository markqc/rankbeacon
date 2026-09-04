interface Props {
    className?: string;
}

export default function Lighthouse({ className = 'h-8 w-8' }: Props) {
    return (
        <svg
            className={className}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <path d="M24 4L27 14H21L24 4Z" fill="#0EA5A8" />
            <rect x="20" y="14" width="8" height="24" rx="2" fill="#10233F" />
            <circle cx="24" cy="12" r="3" fill="#EAF4FF" stroke="#10233F" strokeWidth="2" />
            <path d="M32 12L40 8M32 12L40 16" stroke="#0EA5A8" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 38H36" stroke="#10233F" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}
