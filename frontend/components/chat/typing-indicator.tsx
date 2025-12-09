export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5" aria-live="polite" aria-label="AI typing">
      <span className="inline-flex h-2.5 w-2.5 animate-bounce rounded-full bg-foreground/50"></span>
      <span className="inline-flex h-2.5 w-2.5 animate-bounce rounded-full bg-foreground/50 [animation-delay:120ms]"></span>
      <span className="inline-flex h-2.5 w-2.5 animate-bounce rounded-full bg-foreground/50 [animation-delay:240ms]"></span>
      <span className="sr-only">AI is typing...</span>
    </div>
  )
}
