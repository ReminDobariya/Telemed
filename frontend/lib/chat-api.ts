// API Response types
export interface ChatApiResponse {
  success: true
  message: string
  conversationId: string
  timestamp: string
}

export interface ChatApiError {
  success: false
  error: string
  message?: string
}

export type ChatApiResult = ChatApiResponse | ChatApiError

// Get API URLs from environment variables only
function getApiUrls(): string[] {
  // Get URLs from env - can be single URL or comma-separated list
  const envUrls = process.env.NEXT_PUBLIC_API_URLS || process.env.NEXT_PUBLIC_API_URL;
  
  if (!envUrls) {
    throw new Error('NEXT_PUBLIC_API_URLS or NEXT_PUBLIC_API_URL must be set in environment variables');
  }
  
  // Split by comma and trim whitespace
  const urls = envUrls.split(',').map(url => url.trim()).filter(url => url.length > 0);
  
  if (urls.length === 0) {
    throw new Error('At least one API URL must be provided in NEXT_PUBLIC_API_URLS');
  }
  
  return urls;
}

const API_URLS = getApiUrls();

// Try fetching with fallback URLs from environment
async function fetchWithFallback(url: string, options: RequestInit): Promise<Response> {
  let lastError: Error | null = null;
  
  // Try each URL from environment variables
  for (const baseUrl of API_URLS) {
    try {
      const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
      const res = await fetch(fullUrl, options);
      
      // If successful, return the response
      if (res.ok) {
        return res;
      }
      
      // If not ok but not a network error, throw with status
      if (res.status !== 0) {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      // Continue to next URL
      continue;
    }
  }
  
  // If all URLs failed, throw the last error
  throw lastError || new Error(`All API endpoints failed. Tried: ${API_URLS.join(', ')}`);
}

/**
 * Send a message to the chat API
 */
export async function sendChatMessage(
  message: string,
  conversationId?: string,
  languageCode?: string,
  userId?: string,
): Promise<ChatApiResult> {
  try {
    const response = await fetchWithFallback('/api/chat/message', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: message.trim(),
        conversationId: conversationId || undefined,
        languageCode: languageCode || 'en',
        userId: userId || undefined,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (!data.success) {
      return {
        success: false,
        error: data.error || "Failed to get response from AI",
        message: data.message
      }
    }

    return {
      success: true,
      message: data.message,
      conversationId: data.conversationId,
      timestamp: data.timestamp || new Date().toISOString(),
    }

  } catch (error) {
    console.error("Error sending chat message:", error)
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        error: "Network error: Unable to connect to the server. Please check your internet connection."
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred"
    }
  }
}

/**
 * Upload an image for analysis
 */
export async function uploadImageForAnalysis(
  imageFile: File,
  message: string,
  conversationId?: string,
  languageCode?: string,
  userId?: string,
): Promise<ChatApiResult> {
  try {
    const formData = new FormData()
    formData.append('image', imageFile)
    formData.append('message', message.trim())
    formData.append('languageCode', languageCode || 'en')
    if (userId) formData.append('userId', userId)
    if (conversationId) {
      formData.append('conversationId', conversationId)
    }

    const response = await fetchWithFallback('/api/chat/upload-image', {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (!data.success) {
      return {
        success: false,
        error: data.error || "Failed to analyze image",
        message: data.message
      }
    }

    return {
      success: true,
      message: data.message,
      conversationId: data.conversationId,
      timestamp: data.timestamp || new Date().toISOString(),
    }

  } catch (error) {
    console.error("Error uploading image:", error)
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        error: "Network error: Unable to connect to the server. Please check your internet connection."
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred"
    }
  }
}

/**
 * Check if the API server is reachable
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetchWithFallback('/health', {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
    
    return response.ok
  } catch {
    return false
  }
}
