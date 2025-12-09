// Test connection to backend API
export async function testBackendConnection() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
  
  console.log('Testing connection to:', API_BASE_URL)
  
  try {
    // Test health endpoint
    const healthResponse = await fetch(`${API_BASE_URL}/health`)
    console.log('Health check status:', healthResponse.status)
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json()
      console.log('Health check response:', healthData)
    }
    
    // Test chat endpoint
    const chatResponse = await fetch(`${API_BASE_URL}/api/chat/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Hello, this is a test message",
        conversationId: undefined,
      }),
    })
    
    console.log('Chat API status:', chatResponse.status)
    
    if (chatResponse.ok) {
      const chatData = await chatResponse.json()
      console.log('Chat API response:', chatData)
      return { success: true, data: chatData }
    } else {
      const errorText = await chatResponse.text()
      console.error('Chat API error:', errorText)
      return { success: false, error: `HTTP ${chatResponse.status}: ${errorText}` }
    }
    
  } catch (error) {
    console.error('Connection test failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

// Call this function in browser console to test
if (typeof window !== 'undefined') {
  (window as any).testBackendConnection = testBackendConnection
}
