import { tavily } from '@tavily/core'

function getClient() {
  return tavily({ apiKey: process.env.TAVILY_API_KEY })
}

function classifyType(url = '', title = '') {
  const u = url.toLowerCase()
  const t = title.toLowerCase()
  if (u.includes('youtube.com') || u.includes('youtu.be') || u.includes('vimeo.com') || t.includes('video') || t.includes('watch')) return 'video'
  if (u.includes('/docs') || u.includes('documentation') || u.includes('developer.mozilla') || u.includes('devdocs') || t.includes('docs') || t.includes('reference') || t.includes('api')) return 'docs'
  return 'article'
}

function estimateDuration(type, content = '') {
  if (type === 'video') return `${5 + Math.floor(Math.random() * 25)} min`
  const words = content.split(/\s+/).length
  const minutes = Math.max(3, Math.round(words / 200))
  return `${minutes} min read`
}

export async function researcherNode(state) {
  const { currentNode, focusConcepts = [] } = state
  const { title, topics = [] } = currentNode
  const isReview = focusConcepts.length > 0

  // Review-mode: target the weak concepts directly with explainer-style queries
  const query = isReview
    ? `${focusConcepts.slice(0, 3).join(' ')} ${title} explained examples`
    : `${title} ${topics.slice(0, 3).join(' ')} tutorial guide`

  const result = await getClient().search(query, {
    max_results: 5,
    search_depth: 'advanced',
  })

  const resources = result.results
    .filter(r => r.url && r.title)
    .slice(0, 3)
    .map(r => {
      const type = classifyType(r.url, r.title)
      return {
        title:    r.title,
        url:      r.url,
        type,
        duration: estimateDuration(type, r.content || ''),
      }
    })

  return { resources }
}
