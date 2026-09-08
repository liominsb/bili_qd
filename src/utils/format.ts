export function formatPubdate(timestamp: number): string {
    if (!timestamp) return ''

    const targetTime = timestamp * 1000
    const now = Date.now()
    const diffSeconds = Math.floor((now - targetTime) / 1000)

    if (diffSeconds < 60) {
        return '刚刚'
    }
    if (diffSeconds < 3600) {
        return `${Math.floor(diffSeconds / 60)}分钟前`
    }
    if (diffSeconds < 86400) {
        return `${Math.floor(diffSeconds / 3600)}小时前`
    }
    if (diffSeconds < 86400 * 30) {
        return `${Math.floor(diffSeconds / 86400)}天前`
    }

    // 超过一个月显示具体年月日 (YYYY-MM-DD)
    const date = new Date(targetTime)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

// 秒 → "12:34" / "1:02:03"（不足 1 小时不显示小时位）
export function formatDuration(seconds: number): string {
    if (!seconds) return ''
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    if (h > 0) {
        return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    }
    return `${m}:${String(s).padStart(2, '0')}`
}