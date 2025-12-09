import { cn } from "@/lib/utils"
import type { ChatMessage } from "@/lib/ai"
import { Volume2, VolumeX } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "@/components/language/language-provider"

// Enhanced markdown parser for consistent formatting
function parseMarkdown(text: string): string[] {
  const paragraphs = text.split('\n\n').map(paragraph => {
    if (!paragraph.trim()) return null

    // Handle headers first (before other formatting)
    let formatted = paragraph
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-4 mb-3">$1</h1>')

    // Handle bold text
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

    // Handle italic text
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>')

    // Handle bullet points and numbered lists
    const lines = formatted.split('\n')
    const processedLines = lines.map(line => {
      const trimmed = line.trim()

      // Skip empty lines
      if (!trimmed) return ''

      // Bullet points
      if (trimmed.startsWith('- ')) {
        return `<li class="ml-4">${trimmed.substring(2)}</li>`
      }

      // Numbered lists
      if (/^\d+\.\s/.test(trimmed)) {
        return `<li class="ml-4">${trimmed.replace(/^\d+\.\s/, '')}</li>`
      }

      return line
    })

    // Group list items into a <ul> if present
    const listItems = processedLines.filter(line => line.includes('<li'))
    if (listItems.length > 0) {
      const nonListItems = processedLines.filter(line => !line.includes('<li'))
      const listHtml = `<ul class="list-disc list-inside space-y-1 mb-3">${listItems.join('')}</ul>`
      return nonListItems.length > 0
        ? `${nonListItems.join('<br>')}<br>${listHtml}`
        : listHtml
    }

    return processedLines.join('<br>')
  })

  // Remove nulls and assert type
  return paragraphs.filter(Boolean) as string[]
}

export function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isAI = msg.sender === "ai"
  const [isSpeaking, setIsSpeaking] = useState(false)
  const t = useTranslation()

  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Stop any current speech
      window.speechSynthesis.cancel()

      // Clean text for speech (remove markdown formatting)
      const cleanText = text
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/#{1,3}\s/g, '')
        .replace(/\[.*?\]\(.*?\)/g, '')
        .replace(/---/g, '')
        .trim()

      const utterance = new SpeechSynthesisUtterance(cleanText)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 0.8

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      window.speechSynthesis.speak(utterance)
    }
  }

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  return (
    <div
      className={cn("flex w-full", isAI ? "justify-start" : "justify-end")}
      role="listitem"
      aria-label={isAI ? "AI message" : "Your message"}
    >
      <div
        className={cn(
          "max-w-[90%] md:max-w-[70%] break-words rounded-lg px-4 py-3 text-[15px] leading-7",
          isAI ? "bg-muted text-foreground" : "bg-primary text-primary-foreground",
        )}
      >
        {/* Render image if user sent data URL */}
        {!isAI && typeof msg.message === "string" && msg.message.startsWith("data:image") ? (
          <img
            src={msg.message}
            alt="Uploaded"
            className="rounded-md max-h-56 object-cover"
          />
        ) : isAI ? (
          <div className="space-y-2">
            {parseMarkdown(msg.message).map((paragraph, index) => (
              <div
                key={index}
                className="prose prose-sm max-w-none [&_strong]:font-semibold [&_em]:italic [&_ul]:list-disc [&_ul]:list-inside [&_ul]:space-y-1 [&_ul]:mb-2 [&_li]:text-sm [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-4 [&_h1]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2"
                dangerouslySetInnerHTML={{ __html: paragraph }}
              />
            ))}
          </div>
        ) : (
          <p>{msg.message}</p>
        )}

        <div className="flex items-center justify-between mt-2">
          <p
            className={cn(
              "text-[12px]",
              isAI ? "text-muted-foreground" : "text-primary-foreground/80"
            )}
          >
            {new Date(msg.timestamp).toLocaleTimeString()}
          </p>
          {isAI && (
            <button
              onClick={() => isSpeaking ? stopSpeaking() : speakText(msg.message)}
              className={cn(
                "ml-2 p-1 rounded-full transition-colors",
                isSpeaking 
                  ? "bg-red-100 text-red-600 hover:bg-red-200" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
              aria-label={isSpeaking ? t('chat.stopSpeaking') : t('chat.readAloud')}
            >
              {isSpeaking ? (
                <VolumeX className="h-3 w-3" />
              ) : (
                <Volume2 className="h-3 w-3" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
