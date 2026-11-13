export function formatReleaseDate(value?: string): string {
    if (!value) return '';
    if (value.length <= 4) return value;

    const d = new Date(value);
    if (isNaN(d.getTime())) return value;

    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
    });
}