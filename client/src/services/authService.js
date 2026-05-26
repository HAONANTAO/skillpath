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

export async function googleLogin(accessToken) {
  return request('/google', { access_token: accessToken })
}

export async function forgotPassword(email) {
  return request('/forgot-password', { email })
}

export async function resetPassword(token, password) {
  return request('/reset-password', { token, password })
}

// Authenticated profile helpers
async function authedRequest(path, { method = 'GET', body } = {}) {
  const token = getToken()
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'Something went wrong')
  return data
}

export async function fetchMe() {
  return authedRequest('/me')
}

export async function updateProfile({ name }) {
  return authedRequest('/me', { method: 'PATCH', body: { name } })
}

export async function changePassword({ currentPassword, newPassword }) {
  return authedRequest('/change-password', { method: 'POST', body: { currentPassword, newPassword } })
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
