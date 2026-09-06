import type { Device, SerpState } from './types';

export const SERP_FONTS = {
    title: '20px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    description:
        '14px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    url: '14px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

export const SERP_THRESHOLDS: Record<
    Device,
    {
        titleMax: number;
        titleMaxWidth: number;
        titleWarningRatio: number;
        descMaxWidth: number;
        descMaxLines: number;
        descMaxPixels: number;
        descMaxChars: number;
        descEllipsisChars: number;
        descWarningRatio: number;
        previewWidth: number;
    }
> = {
    desktop: {
        titleMax: 600,
        titleMaxWidth: 600,
        titleWarningRatio: 0.8,
        descMaxWidth: 600,
        descMaxLines: 99,
        descMaxPixels: 920,
        descMaxChars: 100,
        descEllipsisChars: 139,
        descWarningRatio: 0.8,
        previewWidth: 600,
    },
    mobile: {
        titleMax: 805,
        titleMaxWidth: 360,
        titleWarningRatio: 0.8,
        descMaxWidth: 360,
        descMaxLines: 99,
        descMaxPixels: 920,
        descMaxChars: 100,
        descEllipsisChars: 139,
        descWarningRatio: 0.8,
        previewWidth: 360,
    },
};

export const SAMPLE: SerpState = {
    url: 'https://rankbeacon.app/tools/serp-preview',
    siteName: 'RankBeacon',
    title: 'SERP Preview — RankBeacon',
    description: 'Preview your page title and description before searchers see them in Google results.',
    breadcrumb: 'tools/serp-preview',
    faviconUrl: null,
    device: 'desktop',
};
