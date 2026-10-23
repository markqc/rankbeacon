import { DESCRIPTION_FIT_THRESHOLDS } from './constants';

export type Status = 'safe' | 'short' | 'warning' | 'truncated';

export type DescriptionFit = 'allPlatforms' | 'googleDesktop' | 'bingYahoo' | 'none';

export function classifyDescriptionFit(width: number): DescriptionFit {
    if (width <= DESCRIPTION_FIT_THRESHOLDS.allPlatforms) return 'allPlatforms';
    if (width <= DESCRIPTION_FIT_THRESHOLDS.googleDesktop) return 'googleDesktop';
    if (width <= DESCRIPTION_FIT_THRESHOLDS.bingYahoo) return 'bingYahoo';
    return 'none';
}

export function classify(width: number, max: number, warningRatio = 0.8): Status {
    if (width > max) return 'truncated';
    if (width > max * warningRatio) return 'warning';
    return 'safe';
}

export function statusTone(status: Status): 'success' | 'warning' | 'danger' {
    switch (status) {
        case 'safe':
            return 'success';
        case 'short':
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
        case 'short':
            return 'Too short';
        case 'warning':
            return 'Approaching limit';
        case 'truncated':
            return 'Likely truncated';
    }
}
