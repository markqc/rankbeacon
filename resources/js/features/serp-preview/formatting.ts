export function sanitizeInput(text: string): string {
    return text.replace(/<[^>]*>?/gm, '').trim();
}

export function formatUrl(
    url: string,
    siteName: string,
    breadcrumb: string,
): { domain: string; display: string; displayUrl: string; displayPath: string } {
    const raw = url.trim();
    let domain = raw;
    let pathname = '';
    let fullHost = raw;

    try {
        const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
        const parsed = new URL(withScheme);
        domain = parsed.hostname.replace(/^www\./i, '');
        pathname = parsed.pathname.replace(/^\/+|\/+$/g, '');
        fullHost = `${parsed.protocol}//${parsed.host}`;
    } catch {
        const withoutScheme = raw.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
        const parts = withoutScheme.split(/[?#]/, 1);
        const [host, ...pathParts] = parts[0]?.split('/') ?? [];
        domain = host || raw;
        pathname = pathParts.join('/').replace(/[?#].*$/, '');
        fullHost = /^https?:\/\//i.test(raw) ? (raw.split(/[?#]/, 1)[0] ?? raw) : `https://${domain}`;
    }

    const displayPath = breadcrumb.trim() || pathname;
    const pathSegments = displayPath
        .replace(/[?#].*$/, '')
        .split('/')
        .filter(Boolean);
    const site = siteName.trim() || domain;
    const display = pathSegments.length ? `${site} › ${pathSegments.join(' › ')}` : site;
    const displayUrl = pathSegments.length ? `${fullHost} › ${pathSegments.join(' › ')}` : fullHost;

    return {
        domain,
        display,
        displayUrl,
        displayPath,
    };
}
