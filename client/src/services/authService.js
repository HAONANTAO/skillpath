const API = '/api/auth'

async function request(path, body) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Something went wrong')
  return data
}

export async function register(name, email, password) {
  return request('/register', { name, email, password })
}

export async function login(email, password) {
  return request('/login', { email, password })
}

export function saveAuth(token, user) {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
}

export function getToken() {
  return localStorage.getItem('token')
}

export function clearAuth() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}
