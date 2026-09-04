export type Status = 'safe' | 'warning' | 'truncated';

export function classify(width: number, max: number, warningRatio = 0.8): Status {
    if (width > max) return 'truncated';
    if (width > max * warningRatio) return 'warning';
    return 'safe';
}

export function statusTone(status: Status): 'success' | 'warning' | 'danger' {
    switch (status) {
        case 'safe':
            return 'success';
        case 'warning':
            return 'warning';
        case 'truncated':
            return 'danger';
    }
}

export function statusLabel(status: Status): string {
    switch (status) {
        case 'safe':
            return 'Within range';
        case 'warning':
            return 'Approaching limit';
        case 'truncated':
            return 'Likely truncated';
    }
}
