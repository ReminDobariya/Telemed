export default function MobileNav() {
  return (
    <div className="mx-auto flex max-w-screen-xl items-center justify-between gap-1 px-2 py-2">
      {/* Example items - ensure these match your routes */}
      <a href="/dashboard" className="flex flex-1 flex-col items-center gap-1 text-xs">
        <span className="size-5">🏠</span>
        <span className="hidden xs:block">Home</span>
      </a>
      <a href="/chat" className="flex flex-1 flex-col items-center gap-1 text-xs">
        <span className="size-5">💬</span>
        <span className="hidden xs:block">Chat</span>
      </a>
      <a href="/appointments" className="flex flex-1 flex-col items-center gap-1 text-xs">
        <span className="size-5">📅</span>
        <span className="hidden xs:block">Appointments</span>
      </a>
      <a href="/find-doctors" className="flex flex-1 flex-col items-center gap-1 text-xs">
        <span className="size-5">👨‍⚕️</span>
        <span className="hidden xs:block">Doctors</span>
      </a>
      <a href="/profile" className="flex flex-1 flex-col items-center gap-1 text-xs">
        <span className="size-5">👤</span>
        <span className="hidden xs:block">Profile</span>
      </a>
    </div>
  )
}
