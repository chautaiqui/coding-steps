import normalizeUrl from "normalize-url";

export function createUrl(
    hostname: string,
    port: number,
    path: string
): string {
    const protocol = location.protocol === "https:" ? "wss" : "ws";
    return normalizeUrl(`${protocol}://${hostname}:${port}${path}`);
}

export function convertTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);

    let sStr = s.toString();
    let mStr = m.toString();

    if (s < 10) sStr = "0" + sStr;
    if (m < 10) mStr = "0" + mStr;

    return `${mStr}:${sStr}`;
}
