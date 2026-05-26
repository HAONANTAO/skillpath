// Topic → visual metadata (tag label + color). Used by path cards and any
// surface that shows a path in list form.
export function deriveMeta(topic = '') {
  const t = topic.toLowerCase()
  if (/react|vue|angular|svelte|css|html|tailwind|frontend/.test(t))
    return { tag: 'Frontend', tagColor: 'purple', color: '#7C6AF7' }
  if (/node|express|django|flask|fastapi|spring|backend|api|server|database|sql|mongodb/.test(t))
    return { tag: 'Backend', tagColor: 'blue', color: '#60a5fa' }
  if (/typescript|javascript|python|golang|rust|kotlin|swift|java|language/.test(t))
    return { tag: 'Language', tagColor: 'green', color: '#34d399' }
  if (/machine\s*learning|ml\b|ai\b|data\s*science|deep\s*learning/.test(t))
    return { tag: 'AI/ML', tagColor: 'gold', color: '#f7c66a' }
  return { tag: 'General', tagColor: 'gray', color: '#7a7a94' }
}

export function timeAgo(iso) {
  if (!iso) return ''
  const ms = Date.now() - new Date(iso).getTime()
  if (ms < 60_000)         return 'just now'
  if (ms < 3_600_000)      return `${Math.floor(ms / 60_000)}m ago`
  if (ms < 86_400_000)     return `${Math.floor(ms / 3_600_000)}h ago`
  if (ms < 7 * 86_400_000) return `${Math.floor(ms / 86_400_000)}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
