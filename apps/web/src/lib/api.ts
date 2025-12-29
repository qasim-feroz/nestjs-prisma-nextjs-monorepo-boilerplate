const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

// Get auth token from cookies or localStorage
function getToken(): string | null {
  if (typeof document === 'undefined') return null
  
  // Try cookies first - properly extract token value
  const cookies = document.cookie.split(';')
  const tokenCookie = cookies.find(cookie => {
    const trimmed = cookie.trim()
    return trimmed.startsWith('token=')
  })
  
  let tokenFromCookie: string | null = null
  
  if (tokenCookie) {
    // Find the index of the first '=' after 'token'
    const equalsIndex = tokenCookie.indexOf('=')
    if (equalsIndex !== -1) {
      // Get everything after 'token='
      tokenFromCookie = tokenCookie.substring(equalsIndex + 1).trim()
      // Remove any leading '=' that might have been incorrectly included
      if (tokenFromCookie.startsWith('=')) {
        tokenFromCookie = tokenFromCookie.substring(1)
      }
    }
  }
  
  // Fallback to localStorage if cookie not found or invalid
  if (tokenFromCookie && tokenFromCookie.length > 0 && !tokenFromCookie.startsWith('=')) {
    return tokenFromCookie
  }
  
  const tokenFromStorage = localStorage.getItem('token')
  if (tokenFromStorage && tokenFromStorage.length > 0) {
    // Also set it back to cookie to keep them in sync (with proper formatting)
    document.cookie = `token=${tokenFromStorage}; path=/; max-age=604800; SameSite=Lax`
    return tokenFromStorage
  }
  
  return null
}

// API request helper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }

  if (token) {
    // Ensure token doesn't start with '=' (fix for cookie parsing issue)
    const cleanToken = token.startsWith('=') ? token.substring(1) : token
    headers['Authorization'] = `Bearer ${cleanToken}`
    console.log(`API Request to ${endpoint}:`, {
      hasToken: true,
      tokenLength: cleanToken.length,
      tokenPreview: cleanToken.substring(0, 20) + '...',
    })
  } else {
    console.warn('No token found when making API request to:', endpoint)
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: headers as HeadersInit,
    credentials: 'include',
  })
  
  // Log response status for debugging
  if (!response.ok) {
    const errorText = await response.clone().text().catch(() => 'Unable to read error')
    console.error(`API request failed: ${response.status} ${response.statusText}`, {
      endpoint,
      hasToken: !!token,
      errorBody: errorText.substring(0, 200),
    })
  }

  if (!response.ok) {
    // if (response.status === 401) {
    //   // Unauthorized - get error details first
    //   const errorBody = await response.json().catch(() => ({}))
    //   console.error('401 Unauthorized:', {
    //     endpoint,
    //     hasToken: !!token,
    //     tokenLength: token?.length,
    //     error: errorBody,
    //   })
      
    //   // Only clear token and redirect if we're not already on the login page
    //   if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
    //     // Don't clear token immediately - let's log first to debug
    //     console.warn('Token will be cleared due to 401 error')
    //     document.cookie = 'token=; path=/; max-age=0; SameSite=Lax'
    //     localStorage.removeItem('token')
    //     // Small delay to allow logging
    //     setTimeout(() => {
    //       window.location.href = '/auth/login'
    //     }, 100)
    //   }
    //   throw new Error('Unauthorized')
    // }
    // const error = await response.json().catch(() => ({ message: 'An error occurred' }))
    // throw new Error(error.message || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// Projects API
export const projectsApi = {
  getAll: () => apiRequest<any[]>('/projects'),
  getOne: (id: string) => apiRequest<any>(`/projects/${id}`),
  create: (data: { name: string }) => apiRequest<any>('/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: { name?: string }) => apiRequest<any>(`/projects/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiRequest<void>(`/projects/${id}`, {
    method: 'DELETE',
  }),
}

// Tasks API
export const tasksApi = {
  getAll: (projectId?: string) => {
    const query = projectId ? `?projectId=${projectId}` : ''
    return apiRequest<any[]>(`/tasks${query}`)
  },
  getOne: (id: string) => apiRequest<any>(`/tasks/${id}`),
  create: (data: { title: string; description?: string; projectId: string; status?: string }) =>
    apiRequest<any>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: { title?: string; description?: string; status?: string }) =>
    apiRequest<any>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (id: string) => apiRequest<void>(`/tasks/${id}`, {
    method: 'DELETE',
  }),
}

