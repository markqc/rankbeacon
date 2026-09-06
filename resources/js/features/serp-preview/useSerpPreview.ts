import { useMemo, useState } from 'react';
import { classify } from './classification';
import { DESCRIPTION_MIN_CHARS, SAMPLE, SERP_FONTS, SERP_THRESHOLDS, TITLE_MIN_CHARS } from './constants';
import { formatUrl } from './formatting';
import { createCanvasMeasurer, measureText, splitDescriptionOverflow, truncateToWidth } from './textMeasurement';
import { isSafeFaviconUrl } from './api';
import type { ApiData, SerpState } from './types';

export function useSerpPreview(initial: SerpState = SAMPLE) {
    const [state, setState] = useState<SerpState>(initial);
    const measure = useMemo(() => createCanvasMeasurer(), []);
    const thresholds = SERP_THRESHOLDS[state.device];

    const setField = (field: keyof SerpState, value: SerpState[keyof SerpState]) => {
        setState((prev) => ({ ...prev, [field]: value }));
    };

    const reset = () => {
        setState(SAMPLE);
    };

    const setFromApi = (data: ApiData) => {
        setState((prev) => ({
            ...prev,
            url: data.final_url || data.normalized_url || prev.url,
            siteName: '',
            title: data.title ?? '',
            description: data.description ?? '',
            breadcrumb: data.breadcrumb_path ?? '',
            faviconUrl:
                data.favicon_url && isSafeFaviconUrl(data.favicon_url, data.final_url) ? data.favicon_url : null,
        }));
    };

    const formattedUrl = useMemo(
        () => formatUrl(state.url, state.siteName, state.breadcrumb),
        [state.url, state.siteName, state.breadcrumb],
    );

    const titleWidth = useMemo(() => measureText(state.title, SERP_FONTS.title, measure), [state.title, measure]);
    const titleMax = thresholds.titleMax;
    const titleMaxWidth = thresholds.titleMaxWidth;
    const titleStatus = useMemo(() => {
        if (state.title.length > 0 && state.title.length <= TITLE_MIN_CHARS) {
            return 'short';
        }
        return classify(titleWidth, titleMax, thresholds.titleWarningRatio);
    }, [state.title.length, titleWidth, titleMax, thresholds.titleWarningRatio]);
    const titleTruncated = useMemo(
        () =>
            titleWidth > titleMaxWidth
                ? truncateToWidth(state.title, titleMaxWidth, SERP_FONTS.title, measure)
                : state.title,
        [state.title, titleWidth, titleMaxWidth, measure],
    );

    const descriptionWidth = useMemo(
        () => measureText(state.description, SERP_FONTS.description, measure),
        [state.description, measure],
    );
    const descriptionMax = thresholds.descMaxPixels;
    const descriptionMaxChars = thresholds.descMaxChars;
    const descriptionStatus = useMemo(() => {
        if (state.description.length > 0 && state.description.length <= DESCRIPTION_MIN_CHARS) {
            return 'short';
        }
        return classify(descriptionWidth, descriptionMax, thresholds.descWarningRatio);
    }, [state.description.length, descriptionWidth, descriptionMax, thresholds.descWarningRatio]);
    const splitAtMax = useMemo(
        () =>
            splitDescriptionOverflow(
                state.description,
                thresholds.descMaxWidth,
                thresholds.descMaxLines,
                thresholds.descMaxPixels,
                thresholds.descMaxChars,
                SERP_FONTS.description,
                measure,
            ),
        [
            state.description,
            thresholds.descMaxWidth,
            thresholds.descMaxLines,
            thresholds.descMaxPixels,
            thresholds.descMaxChars,
            measure,
        ],
    );
    const splitAtEllipsis = useMemo(
        () =>
            splitDescriptionOverflow(
                state.description,
                thresholds.descMaxWidth,
                thresholds.descMaxLines,
                thresholds.descMaxPixels,
                thresholds.descEllipsisChars,
                SERP_FONTS.description,
                measure,
            ),
        [
            state.description,
            thresholds.descMaxWidth,
            thresholds.descMaxLines,
            thresholds.descMaxPixels,
            thresholds.descEllipsisChars,
            measure,
        ],
    );

    const descriptionVisible = splitAtMax.visible;
    const descriptionOverflow = splitAtEllipsis.visible.slice(splitAtMax.visible.length).trimStart();
    const descriptionHasMore = splitAtEllipsis.overflow.length > 0;

    return {
        state,
        setField,
        setFromApi,
        reset,
        formattedUrl,
        titleWidth,
        titleMax,
        titleStatus,
        titleTruncated,
        descriptionWidth,
        descriptionMax,
        descriptionMaxChars,
        descriptionStatus,
        descriptionVisible,
        descriptionOverflow,
        descriptionHasMore,
        thresholds,
    };
}
