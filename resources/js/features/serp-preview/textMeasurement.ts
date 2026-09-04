export type MeasureText = (text: string, font: string) => number;

function isFullWidth(char: string): boolean {
    return /[\u1100-\u115F\u2E80-\uA4CF\uAC00-\uD7AF\uF900-\uFAFF\uFE30-\uFE4F\uFF01-\uFF60\uFFE0-\uFFE6]/.test(char);
}

export function toGraphemes(text: string): string[] {
    return Array.from(text);
}

export function fallbackMeasure(text: string, font: string): number {
    const size = parseFloat(font) || 16;

    return toGraphemes(text).reduce((sum, char) => {
        const factor = isFullWidth(char) ? 0.9 : 0.52;
        return sum + size * factor;
    }, 0);
}

export function createCanvasMeasurer(): MeasureText {
    if (typeof document !== 'undefined') {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (ctx) {
            return (text: string, font: string) => {
                ctx.font = font;
                return ctx.measureText(text).width;
            };
        }
    }

    return fallbackMeasure;
}

export function measureText(text: string, font: string, measure: MeasureText = createCanvasMeasurer()): number {
    if (!text) return 0;
    return measure(text, font);
}

export function splitDescriptionOverflow(
    text: string,
    maxWidth: number,
    maxLines: number,
    maxPixels: number,
    maxChars: number,
    font: string,
    measure: MeasureText = createCanvasMeasurer(),
): { visible: string; overflow: string } {
    const words = [...text.matchAll(/\S+/g)].map((match) => ({
        word: match[0],
        index: match.index ?? 0,
    }));

    if (words.length === 0) {
        return { visible: '', overflow: '' };
    }

    let line = 1;
    let currentWidth = 0;
    let totalWidth = 0;
    let visibleChars = 0;
    let overflowStart = -1;
    const spaceWidth = measureText(' ', font, measure);

    for (const { word, index } of words) {
        const wordWidth = measureText(word, font, measure);
        const wouldSpace = currentWidth > 0 ? spaceWidth : 0;
        const wouldChars = currentWidth > 0 ? word.length + 1 : word.length;
        const proposed = currentWidth + wouldSpace + wordWidth;

        if (proposed <= maxWidth) {
            if (totalWidth + wouldSpace + wordWidth > maxPixels || visibleChars + wouldChars > maxChars) {
                overflowStart = index;
                break;
            }

            currentWidth = proposed;
            totalWidth += wouldSpace + wordWidth;
            visibleChars += wouldChars;
        } else if (line < maxLines) {
            if (totalWidth + wordWidth > maxPixels || visibleChars + word.length > maxChars) {
                overflowStart = index;
                break;
            }

            line++;
            currentWidth = wordWidth;
            totalWidth += wordWidth;
            visibleChars += word.length;
        } else {
            overflowStart = index;
            break;
        }
    }

    if (overflowStart === -1) {
        return { visible: text, overflow: '' };
    }

    const visible = text.slice(0, overflowStart).trimEnd();
    const overflow = text.slice(overflowStart).trimStart();

    return { visible, overflow };
}

export function truncateToWidth(
    text: string,
    maxWidth: number,
    font: string,
    measure: MeasureText = createCanvasMeasurer(),
    ellipsis: string = '…',
): string {
    if (maxWidth <= 0) return ellipsis;

    const width = measure(text, font);
    if (width <= maxWidth) return text;

    const ellipsisWidth = measure(ellipsis, font);
    const available = maxWidth - ellipsisWidth;
    if (available <= 0) return ellipsis;

    const graphemes = toGraphemes(text);
    let low = 0;
    let high = graphemes.length;

    while (low < high) {
        const mid = Math.floor((low + high + 1) / 2);
        const prefix = graphemes.slice(0, mid).join('');

        if (measure(prefix, font) <= available) {
            low = mid;
        } else {
            high = mid - 1;
        }
    }

    if (low <= 0) return ellipsis;

    return graphemes.slice(0, low).join('') + ellipsis;
}
