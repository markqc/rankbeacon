import { Monitor, MoreVertical, Smartphone } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Alert from '../../components/Alert';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Card from '../../components/Card';
import FormField from '../../components/FormField';
import TextInput from '../../components/TextInput';
import Textarea from '../../components/Textarea';
import { buildWarnings, fetchMetadata } from './api';
import { statusLabel, statusTone, type Status } from './classification';
import { FAVICON_OPTIONS } from './constants';
import { useSerpPreview } from './useSerpPreview';
import type { ApiResponse, Device, FaviconKey, FetchStatus } from './types';

function LengthIndicator({
    label,
    width,
    max,
    status,
    characters,
    maxChars,
}: {
    label: string;
    width: number;
    max: number;
    status: Status;
    characters?: number;
    maxChars?: number;
}) {
    return (
        <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">{label}</span>
            <div className="flex items-center gap-2">
                <Badge tone={statusTone(status)}>{statusLabel(status)}</Badge>
                <span
                    className="tabular-nums text-slate-600"
                    title={maxChars !== undefined ? `Max: ${max}px or ${maxChars} chars` : `Max: ${max}px`}
                >
                    pixels: {Math.round(width)}
                    {characters !== undefined
                        ? `, characters: ${characters}${maxChars !== undefined ? ` / ${maxChars}` : ''}`
                        : ''}
                </span>
            </div>
        </div>
    );
}

function resolveStatus(response: ApiResponse, hasWarnings: boolean): FetchStatus {
    if (response.error) {
        switch (response.error.code) {
            case 'TOO_MANY_REQUESTS':
                return { type: 'rate-limited', message: response.error.message };
            case 'MISSING_URL':
            case 'URL_TOO_LONG':
            case 'MALFORMED_URL':
            case 'UNSUPPORTED_SCHEME':
            case 'CREDENTIALS_IN_URL':
            case 'INVALID_HOST':
            case 'AMBIGUOUS_HOST':
            case 'DNS_FAILED':
            case 'IDN_FAILED':
            case 'IDN_NOT_SUPPORTED':
            case 'PRIVATE_IP':
                return { type: 'blocked-url', message: response.error.message };
            case 'UNSUPPORTED_CONTENT_TYPE':
                return { type: 'unsupported-content', message: response.error.message };
            default:
                return { type: 'error', message: response.error.message };
        }
    }

    if (response.data && (hasWarnings || response.data.status >= 400)) {
        return {
            type: 'partial-success',
            message: 'Fetched metadata, but some issues were reported.',
        };
    }

    if (response.data) {
        return { type: 'success', message: 'Fetched metadata successfully.' };
    }

    return { type: 'error', message: 'Unexpected response from the server.' };
}

export default function SerpPreviewTool() {
    const {
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
    } = useSerpPreview();

    const [fetchStatus, setFetchStatus] = useState<FetchStatus>({ type: 'idle' });
    const [apiWarnings, setApiWarnings] = useState<string[]>([]);
    const [faviconImageError, setFaviconImageError] = useState(false);
    const abortRef = useRef<AbortController | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            abortRef.current?.abort('unmount');
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        setFaviconImageError(false);
    }, [state.faviconUrl]);

    const selectedFavicon = FAVICON_OPTIONS.find((option) => option.value === state.favicon);
    const FaviconIcon = selectedFavicon?.Icon;

    const previewMaxWidth = state.device === 'desktop' ? 'max-w-[600px]' : 'max-w-[360px]';

    const validateUrl = (url: string): string | null => {
        const trimmed = url.trim();

        if (trimmed === '') {
            return 'Please enter a URL.';
        }

        if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
            return 'URL must start with http:// or https://.';
        }

        return null;
    };

    const runFetch = async (url: string) => {
        setFetchStatus({ type: 'loading' });
        setApiWarnings([]);

        abortRef.current?.abort('new request');

        const controller = new AbortController();
        abortRef.current = controller;

        timeoutRef.current = setTimeout(() => {
            controller.abort(new DOMException('The request timed out.', 'TimeoutError'));
        }, 20000);

        try {
            const response = await fetchMetadata(url, controller.signal);

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }

            if (response.data) {
                const extraWarnings = buildWarnings(response.data);
                const allWarnings = [...response.data.warnings, ...extraWarnings];
                setFromApi(response.data);
                setApiWarnings([...new Set(allWarnings)]);
                setFetchStatus(resolveStatus(response, allWarnings.length > 0 || response.data.status >= 400));
            } else {
                setApiWarnings([]);
                setFetchStatus(resolveStatus(response, false));
            }
        } catch (err) {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }

            if (err instanceof DOMException) {
                if (err.name === 'TimeoutError') {
                    setFetchStatus({
                        type: 'timeout',
                        message: 'The fetch timed out. The page may be slow or unreachable.',
                    });
                } else if (err.name === 'AbortError') {
                    setFetchStatus({ type: 'error', message: 'Fetch was cancelled.' });
                } else {
                    setFetchStatus({ type: 'error', message: 'An unexpected error occurred.' });
                }
            } else if (err instanceof Error) {
                setFetchStatus({ type: 'error', message: err.message });
            } else {
                setFetchStatus({ type: 'error', message: 'An unexpected error occurred.' });
            }
        }
    };

    const handleFetch = (url: string) => {
        setFetchStatus({ type: 'validating' });
        const error = validateUrl(url);

        if (error) {
            setFetchStatus({ type: 'error', message: error });
            return;
        }

        runFetch(url);
    };

    const alertVariant = (): 'info' | 'success' | 'warning' | 'danger' => {
        switch (fetchStatus.type) {
            case 'success':
                return 'success';
            case 'partial-success':
            case 'rate-limited':
            case 'timeout':
            case 'blocked-url':
            case 'unsupported-content':
                return 'warning';
            case 'error':
                return 'danger';
            default:
                return 'info';
        }
    };

    const handleReset = () => {
        reset();
        setFetchStatus({ type: 'idle' });
        setApiWarnings([]);
    };

    return (
        <div className="grid gap-8 lg:grid-cols-2">
            <section aria-label="SERP inputs" className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                    <FormField label="Site name" htmlFor="serp-site-name">
                        <TextInput
                            id="serp-site-name"
                            value={state.siteName}
                            onChange={(e) => setField('siteName', e.target.value)}
                        />
                    </FormField>

                    <FormField label="Breadcrumb / path" htmlFor="serp-breadcrumb">
                        <TextInput
                            id="serp-breadcrumb"
                            value={state.breadcrumb}
                            onChange={(e) => setField('breadcrumb', e.target.value)}
                        />
                    </FormField>

                    <FormField label="Favicon" htmlFor="serp-favicon">
                        <select
                            id="serp-favicon"
                            value={state.favicon}
                            onChange={(e) => setField('favicon', e.target.value as FaviconKey)}
                            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                        >
                            {FAVICON_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </FormField>
                </div>

                <FormField label="Title" htmlFor="serp-title" required>
                    <TextInput
                        id="serp-title"
                        value={state.title}
                        onChange={(e) => setField('title', e.target.value)}
                    />
                    <LengthIndicator
                        label="Title"
                        width={titleWidth}
                        max={titleMax}
                        status={titleStatus}
                        characters={state.title.length}
                    />
                </FormField>

                <FormField label="Meta description" htmlFor="serp-description">
                    <Textarea
                        id="serp-description"
                        value={state.description}
                        onChange={(e) => setField('description', e.target.value)}
                    />
                    <LengthIndicator
                        label="Description"
                        width={descriptionWidth}
                        max={descriptionMax}
                        status={descriptionStatus}
                        characters={state.description.length}
                        maxChars={descriptionMaxChars}
                    />
                </FormField>

                <FormField label="Load from URL" htmlFor="serp-url" required>
                    <div className="space-y-2">
                        <TextInput
                            id="serp-url"
                            value={state.url}
                            onChange={(e) => setField('url', e.target.value)}
                            placeholder="https://..."
                        />
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                type="button"
                                onClick={() => handleFetch(state.url)}
                                disabled={fetchStatus.type === 'loading' || fetchStatus.type === 'validating'}
                                aria-busy={fetchStatus.type === 'loading' || fetchStatus.type === 'validating'}
                            >
                                {fetchStatus.type === 'loading' ? 'Fetching…' : 'Fetch Page'}
                            </Button>
                            <p className="text-xs text-slate-500">
                                Only public http or https URLs are supported. The URL is validated and resolved safely
                                on the server.
                            </p>
                        </div>
                    </div>
                </FormField>

                <div role="status" aria-live="polite" aria-atomic="true" className="space-y-3">
                    {fetchStatus.type !== 'idle' &&
                        fetchStatus.type !== 'loading' &&
                        fetchStatus.type !== 'validating' && (
                            <Alert variant={alertVariant()}>{fetchStatus.message}</Alert>
                        )}
                    {apiWarnings.length > 0 && (
                        <Alert variant="warning" title="Things to check">
                            <ul className="list-disc space-y-1 pl-4">
                                {apiWarnings.map((warning, index) => (
                                    <li key={index}>{warning}</li>
                                ))}
                            </ul>
                        </Alert>
                    )}
                </div>
            </section>

            <section aria-label="SERP preview" className="space-y-4">
                <div className="flex gap-2">
                    <Button
                        type="button"
                        size="sm"
                        variant={state.device === 'desktop' ? 'primary' : 'outline'}
                        aria-pressed={state.device === 'desktop'}
                        onClick={() => setField('device', 'desktop' as Device)}
                    >
                        <Monitor className="mr-2 h-4 w-4" aria-hidden="true" />
                        Desktop
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant={state.device === 'mobile' ? 'primary' : 'outline'}
                        aria-pressed={state.device === 'mobile'}
                        onClick={() => setField('device', 'mobile' as Device)}
                    >
                        <Smartphone className="mr-2 h-4 w-4" aria-hidden="true" />
                        Mobile
                    </Button>
                </div>

                <div className="flex flex-wrap gap-4">
                    <Button type="button" variant="outline" onClick={handleReset}>
                        Reset to sample
                    </Button>
                </div>

                <h2 className="font-semibold text-slate-900">Result:</h2>
                <div className="space-y-3">
                    <Alert variant={statusTone(titleStatus)}>
                        {titleStatus === 'safe' && 'The title can be read everywhere, nice job!'}
                        {titleStatus === 'warning' && 'The title might be truncated in some search results.'}
                        {titleStatus === 'truncated' && 'The title is too long and will likely be truncated.'}
                    </Alert>
                    <Alert variant={statusTone(descriptionStatus)}>
                        {descriptionStatus === 'safe' && 'The meta description can be read everywhere, nice job!'}
                        {descriptionStatus === 'warning' && 'The meta description might be cut off.'}
                        {descriptionStatus === 'truncated' &&
                            'The meta description is probably too long. Make it shorter.'}
                    </Alert>
                </div>

                <Card className={`${previewMaxWidth} w-full`}>
                    <div className="space-y-1">
                        <div className="flex min-w-0 gap-3">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-100">
                                {state.faviconUrl && !faviconImageError ? (
                                    <img
                                        src={state.faviconUrl}
                                        alt=""
                                        className="h-5 w-5 object-contain"
                                        loading="lazy"
                                        onError={() => setFaviconImageError(true)}
                                    />
                                ) : (
                                    FaviconIcon && <FaviconIcon className="h-5 w-5 text-navy-950" aria-hidden="true" />
                                )}
                            </div>
                            <div className="flex min-w-0 flex-1 flex-col">
                                <div className="truncate text-[14px] text-slate-900" dir="auto">
                                    {state.siteName || formattedUrl.domain}
                                </div>
                                <div className="flex min-w-0 items-center gap-1 text-[14px] text-green-700">
                                    <span className="min-w-0 truncate" dir="auto">
                                        {formattedUrl.displayUrl}
                                    </span>
                                    <MoreVertical className="h-3 w-3 flex-shrink-0 text-slate-500" aria-hidden="true" />
                                </div>
                            </div>
                        </div>

                        <h3
                            className="truncate text-[20px] font-medium leading-tight text-blue-700 hover:underline"
                            style={{ maxWidth: thresholds.titleMaxWidth }}
                            dir="auto"
                            title={state.title}
                        >
                            {titleTruncated}
                        </h3>

                        <p
                            className="text-[14px] leading-snug text-slate-700"
                            style={{
                                maxWidth: thresholds.descMaxWidth,
                                overflowWrap: 'anywhere',
                            }}
                            dir="auto"
                        >
                            {descriptionVisible}
                            {descriptionOverflow && (
                                <>
                                    {' '}
                                    <span className="bg-yellow-200/60 text-slate-700">
                                        {descriptionOverflow}
                                        {descriptionHasMore && ' ...'}
                                    </span>
                                </>
                            )}
                        </p>
                    </div>
                </Card>

                <p className="text-xs text-slate-500">
                    Search engines may rewrite titles and snippets. This preview is an estimate based on the selected
                    device width and is not a guarantee.
                </p>
            </section>
        </div>
    );
}
