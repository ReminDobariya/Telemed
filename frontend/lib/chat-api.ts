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

// Base API URL from environment. No fallbacks, no dev tunnels.
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL must be set in environment variables');
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
    const response = await fetch(`${BASE_URL}/api/chat/message`, {
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
      let message = `HTTP ${response.status}`
      try { const data = await response.json(); message = data.error || message } catch {}
      throw new Error(message)
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

    const response = await fetch(`${BASE_URL}/api/chat/upload-image`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      let message = `HTTP ${response.status}`
      try { const data = await response.json(); message = data.error || message } catch {}
      throw new Error(message)
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
    const response = await fetch(`${BASE_URL}/health`, {
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
