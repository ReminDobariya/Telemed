"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Video, VideoOff, PhoneOff, Maximize2, Minimize2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function VideoCall({ 
  appointmentId,
  remoteName,
  localName = "You",
  onEndCall,
  isDoctor = false
}: { 
  appointmentId?: string
  remoteName: string
  localName?: string
  onEndCall: () => void
  isDoctor?: boolean
}) {
  const { toast } = useToast()
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!appointmentId) return

    // Initialize WebRTC connection
    async function initWebRTC() {
      try {
        // Get local media stream
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        })
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream
        }
        setLocalStream(stream)

        // Create RTCPeerConnection
        const configuration: RTCConfiguration = {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        }
        
        const pc = new RTCPeerConnection(configuration)
        peerConnectionRef.current = pc

        // Add local stream tracks to peer connection
        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream)
        })

        // Handle remote stream
        pc.ontrack = (event) => {
          if (remoteVideoRef.current && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0]
            setRemoteStream(event.streams[0])
          }
        }

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
          if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
            try {
              wsRef.current.send(JSON.stringify({
                type: 'ice-candidate',
                candidate: event.candidate,
                appointmentId
              }))
            } catch (error) {
              console.error('Error sending ICE candidate:', error)
            }
          }
        }

        // Connect to signaling server (using simple WebSocket)
        // Automatically detect environment and use appropriate WebSocket URL
        function getWebSocketUrl(): string {
          // Check if we're running in browser
          if (typeof window === 'undefined') {
            return 'ws://localhost:5000';
          }
          
          const currentUrl = window.location.href;
          const isDevTunnel = currentUrl.includes('devtunnels.ms') || currentUrl.includes('tunnel');
          const isLocalhost = currentUrl.includes('localhost') || currentUrl.includes('127.0.0.1');
          
          // Get URLs from env - can be single URL or comma-separated list
          const envUrls = process.env.NEXT_PUBLIC_API_URLS || process.env.NEXT_PUBLIC_API_URL;
          
          if (envUrls) {
            // Split by comma and get all URLs
            const urls = envUrls.split(',').map(url => url.trim()).filter(url => url.length > 0);
            
            if (urls.length > 0) {
              // If on dev tunnel, prefer dev tunnel URL; if localhost, prefer localhost URL
              if (isDevTunnel) {
                // Find dev tunnel URL first
                const tunnelUrl = urls.find(url => url.includes('devtunnels.ms') || url.includes('tunnel'));
                if (tunnelUrl) {
                  return tunnelUrl.replace('http://', 'ws://').replace('https://', 'wss://');
                }
                // Fallback to first URL
                return urls[0].replace('http://', 'ws://').replace('https://', 'wss://');
              } else if (isLocalhost) {
                // Find localhost URL first
                const localhostUrl = urls.find(url => url.includes('localhost') || url.includes('127.0.0.1'));
                if (localhostUrl) {
                  return localhostUrl.replace('http://', 'ws://').replace('https://', 'wss://');
                }
                // Fallback to first URL
                return urls[0].replace('http://', 'ws://').replace('https://', 'wss://');
              } else {
                // Use first URL
                return urls[0].replace('http://', 'ws://').replace('https://', 'wss://');
              }
            }
          }
          
          // Fallback based on current environment
          if (isDevTunnel) {
            // Try to construct backend tunnel URL from frontend URL
            try {
              const frontendUrl = new URL(currentUrl);
              // Replace port 3000 with 5000, or add :5000 if no port
              const hostname = frontendUrl.hostname;
              const protocol = frontendUrl.protocol === 'https:' ? 'wss:' : 'ws:';
              // For dev tunnels, backend is usually on a different subdomain or port
              // Try common patterns
              const possibleUrls = [
                `${protocol}//${hostname.replace(':3000', ':5000')}`,
                `${protocol}//${hostname.replace('3000', '5000')}`,
                `wss://${hostname.split('.')[0]}-5000.${hostname.split('.').slice(1).join('.')}`,
              ];
              // Return first valid-looking URL
              return possibleUrls[0];
            } catch (e) {
              console.error('Error constructing WebSocket URL:', e);
            }
          }
          
          // Default fallback to localhost
          return 'ws://localhost:5000';
        }
        
        // Get all possible WebSocket URLs to try (prioritized by environment)
        function getAllWebSocketUrls(): string[] {
          const urls: string[] = [];
          
          // Detect current environment
          const isDevTunnel = typeof window !== 'undefined' && 
            (window.location.href.includes('devtunnels.ms') || window.location.href.includes('tunnel'));
          const isLocalhost = typeof window !== 'undefined' && 
            (window.location.href.includes('localhost') || window.location.href.includes('127.0.0.1'));
          
          // Get URLs from env
          const envUrls = process.env.NEXT_PUBLIC_API_URLS || process.env.NEXT_PUBLIC_API_URL;
          if (envUrls) {
            const envUrlList = envUrls.split(',').map(url => url.trim()).filter(url => url.length > 0);
            
            // Filter and prioritize URLs based on environment
            if (isDevTunnel) {
              // When on dev tunnel, ONLY use dev tunnel URLs (browser can't access localhost)
              const tunnelUrls = envUrlList.filter(url => url.includes('devtunnels.ms') || url.includes('tunnel'));
              if (tunnelUrls.length > 0) {
                urls.push(...tunnelUrls.map(url => url.replace('http://', 'ws://').replace('https://', 'wss://')));
              } else {
                // If no tunnel URL in env, try to construct from frontend URL
                try {
                  const frontendUrl = new URL(window.location.href);
                  const hostname = frontendUrl.hostname;
                  // Try common dev tunnel patterns
                  const possibleTunnelUrl = `wss://${hostname.split('.')[0]}-5000.${hostname.split('.').slice(1).join('.')}`;
                  urls.push(possibleTunnelUrl);
                } catch (e) {
                  console.error('Could not construct tunnel URL:', e);
                }
              }
            } else if (isLocalhost) {
              // When on localhost, prefer localhost URLs, but can try tunnel as fallback
              const localhostUrls = envUrlList.filter(url => url.includes('localhost') || url.includes('127.0.0.1'));
              const tunnelUrls = envUrlList.filter(url => url.includes('devtunnels.ms') || url.includes('tunnel'));
              urls.push(...localhostUrls.map(url => url.replace('http://', 'ws://').replace('https://', 'wss://')));
              urls.push(...tunnelUrls.map(url => url.replace('http://', 'ws://').replace('https://', 'wss://')));
            } else {
              // Use all URLs in order
              urls.push(...envUrlList.map(url => url.replace('http://', 'ws://').replace('https://', 'wss://')));
            }
          }
          
          // Add localhost fallback ONLY if we're on localhost
          if (isLocalhost && !urls.some(url => url.includes('localhost') || url.includes('127.0.0.1'))) {
            urls.push('ws://localhost:5000');
          }
          
          return urls;
        }
        
        const allWsUrls = getAllWebSocketUrls();
        const wsPath = `/ws/consultation/${appointmentId}?role=${isDoctor ? 'doctor' : 'patient'}`;
        
        console.log(`🔌 WebSocket connection attempt`);
        console.log(`📍 Current location: ${typeof window !== 'undefined' ? window.location.href : 'server'}`);
        console.log(`🌐 Available URLs (in priority order): ${allWsUrls.join(', ')}`);
        
        // Connect with first URL (highest priority)
        let currentWsIndex = 0;
        let ws: WebSocket | null = null;
        
        const connectWebSocket = () => {
          if (currentWsIndex >= allWsUrls.length) {
            console.error('❌ All WebSocket URLs exhausted');
            toast({
              title: "Connection Failed",
              description: "Could not connect to video call server. Please check your backend server.",
              variant: "destructive"
            });
            return;
          }
          
          const wsUrl = `${allWsUrls[currentWsIndex]}${wsPath}`;
          console.log(`🔌 Attempting connection (${currentWsIndex + 1}/${allWsUrls.length}): ${wsUrl}`);
          
          ws = new WebSocket(wsUrl);
          wsRef.current = ws;

          ws.onopen = async () => {
            setIsConnected(true)
            console.log('✅ WebSocket connected successfully to:', wsUrl)
            
            // Small delay to ensure connection is fully established
            await new Promise(resolve => setTimeout(resolve, 100))
            
            // Doctor creates and sends offer immediately
            if (isDoctor) {
              try {
                const offer = await pc.createOffer()
                await pc.setLocalDescription(offer)
                ws!.send(JSON.stringify({
                  type: 'offer',
                  offer: offer,
                  appointmentId
                }))
                console.log('Offer sent by doctor')
              } catch (error) {
                console.error('Error creating offer:', error)
              }
            } else {
              console.log('Patient connected, waiting for offer or doctor connection...')
            }
          }

          ws.onmessage = async (event) => {
          try {
            let dataText: string
            
            // Handle different message types
            if (typeof event.data === "string") {
              dataText = event.data
            } else if (event.data instanceof Blob) {
              dataText = await event.data.text()
            } else if (event.data instanceof ArrayBuffer) {
              dataText = new TextDecoder().decode(event.data)
            } else {
              console.warn("Unknown message type:", typeof event.data, event.data)
              return
            }
            
            const message = JSON.parse(dataText)
            console.log('Received message:', message.type)
            
            if (message.type === 'offer' && !isDoctor) {
              console.log('Patient received offer, creating answer...')
              await pc.setRemoteDescription(new RTCSessionDescription(message.offer))
              const answer = await pc.createAnswer()
              await pc.setLocalDescription(answer)
              ws!.send(JSON.stringify({
                type: 'answer',
                answer: answer,
                appointmentId
              }))
              console.log('Answer sent by patient')
            } else if (message.type === 'answer' && isDoctor) {
              console.log('Doctor received answer')
              await pc.setRemoteDescription(new RTCSessionDescription(message.answer))
            } else if (message.type === 'ice-candidate') {
              console.log('Received ICE candidate')
              if (message.candidate) {
                try {
                  await pc.addIceCandidate(new RTCIceCandidate(message.candidate))
                } catch (error) {
                  console.error('Error adding ICE candidate:', error)
                }
              }
            } else if (message.type === 'peer-connected') {
              console.log(`Peer (${message.role}) has connected`)
              // If patient connects and doctor is already connected, request offer
              if (!isDoctor && message.role === 'doctor') {
                console.log('Patient: Doctor connected, requesting offer...')
                ws!.send(JSON.stringify({
                  type: 'request-offer',
                  appointmentId
                }))
              }
            } else if (message.type === 'request-offer' && isDoctor) {
              // Doctor received request for offer, send it
              console.log('Doctor: Patient requested offer, sending...')
              try {
                const offer = await pc.createOffer()
                await pc.setLocalDescription(offer)
                ws!.send(JSON.stringify({
                  type: 'offer',
                  offer: offer,
                  appointmentId
                }))
              } catch (error) {
                console.error('Error creating offer on request:', error)
              }
            }
          } catch (error) {
            console.error('Error handling WebSocket message:', error)
          }
        }

          ws.onerror = (error) => {
            console.error('❌ WebSocket error on:', wsUrl, error)
            // Try next URL after a short delay
            setTimeout(() => {
              currentWsIndex++;
              if (currentWsIndex < allWsUrls.length) {
                console.log(`🔄 Retrying with next URL...`)
                connectWebSocket();
              } else {
                const errorMsg = `Failed to connect to video call server. Tried: ${allWsUrls.join(', ')}. Make sure the backend server is running.`
                toast({
                  title: "Connection Error",
                  description: errorMsg,
                  variant: "destructive"
                })
              }
            }, 1000);
          }

          ws.onclose = (event) => {
            setIsConnected(false)
            console.log('WebSocket disconnected', event.code, event.reason)
            
            // If not a normal closure and we have more URLs to try, retry
            if (event.code !== 1000 && currentWsIndex < allWsUrls.length - 1) {
              console.log(`🔄 Connection closed (code: ${event.code}), trying next URL...`)
              currentWsIndex++;
              setTimeout(() => connectWebSocket(), 1000);
            } else if (event.code !== 1000) {
              // No more URLs to try
              toast({
                title: "Connection Lost",
                description: "WebSocket connection closed unexpectedly. Please check your backend server.",
                variant: "destructive"
              })
            }
          }
        }
        
        // Start connection
        connectWebSocket();

        // Add connection state change handlers
        pc.onconnectionstatechange = () => {
          console.log('Peer connection state:', pc.connectionState)
          if (pc.connectionState === 'connected') {
            console.log('✅ Peer connection established!')
            toast({
              title: "Connected",
              description: "Video call connection established",
            })
          } else if (pc.connectionState === 'failed') {
            console.error('❌ Peer connection failed')
            toast({
              title: "Connection Failed",
              description: "Failed to establish video connection. Please check your network.",
              variant: "destructive"
            })
          } else if (pc.connectionState === 'disconnected') {
            console.log('⚠️ Peer connection disconnected')
          }
        }

        pc.oniceconnectionstatechange = () => {
          console.log('ICE connection state:', pc.iceConnectionState)
          if (pc.iceConnectionState === 'failed') {
            console.error('❌ ICE connection failed')
            toast({
              title: "Connection Issue",
              description: "Network connection issue. Trying to reconnect...",
              variant: "destructive"
            })
          } else if (pc.iceConnectionState === 'connected') {
            console.log('✅ ICE connection established')
          }
        }
        
        // Handle ICE gathering state
        pc.onicegatheringstatechange = () => {
          console.log('ICE gathering state:', pc.iceGatheringState)
        }

      } catch (error) {
        console.error('Error initializing WebRTC:', error)
        toast({
          title: "Camera/Microphone Access",
          description: "Please allow camera and microphone access to start the video call.",
          variant: "destructive"
        })
      }
    }

    initWebRTC()

    return () => {
      // Cleanup
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop())
      }
      if (remoteStream) {
        remoteStream.getTracks().forEach(track => track.stop())
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close()
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [appointmentId, isDoctor, toast])

  function toggleMute() {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = isMuted
      })
      setIsMuted(!isMuted)
    }
  }

  function toggleVideo() {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = isVideoOff
      })
      setIsVideoOff(!isVideoOff)
    }
  }

  function handleEndCall() {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
    }
    onEndCall()
  }

  function toggleFullscreen() {
    const container = localVideoRef.current?.closest('.video-call-container')
    if (!isFullscreen && container) {
      if (container.requestFullscreen) {
        container.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
    setIsFullscreen(!isFullscreen)
  }

  return (
    <div className="video-call-container relative w-full h-full bg-black rounded-lg overflow-hidden flex flex-col">
      {/* Main Video Grid - Side by Side */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 p-2">
        {/* Remote Video (Other Person) */}
        <div className="relative bg-gray-900 rounded-lg overflow-hidden min-h-[300px]">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          {!remoteStream && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-center text-white">
                <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl font-semibold">{remoteName?.[0]?.toUpperCase() || 'U'}</span>
                </div>
                <p className="text-xl font-medium">{remoteName}</p>
                <p className="text-sm text-gray-400 mt-2">
                  {!isConnected 
                    ? 'Connecting to server...'
                    : (isDoctor ? 'Waiting for patient to join...' : 'Waiting for doctor to join...')}
                </p>
                {!isConnected && (
                  <p className="text-xs text-gray-500 mt-2">
                    Make sure the backend server is running
                  </p>
                )}
              </div>
            </div>
          )}
          {/* Name Overlay */}
          <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-md text-white text-sm">
            <div className="font-medium">{remoteName}</div>
          </div>
        </div>

        {/* Local Video (Self) */}
        <div className="relative bg-gray-900 rounded-lg overflow-hidden min-h-[300px]">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {isVideoOff && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <VideoOff className="h-12 w-12 text-white" />
            </div>
          )}
          {/* Name Overlay */}
          <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-md text-white text-sm">
            <div className="font-medium">{localName}</div>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-black/80 backdrop-blur-sm p-4 border-t border-gray-700">
        <div className="flex items-center justify-center gap-3">
          <Button
            variant={isMuted ? "destructive" : "secondary"}
            size="icon"
            onClick={toggleMute}
            className="rounded-full h-12 w-12"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
          
          <Button
            variant={isVideoOff ? "destructive" : "secondary"}
            size="icon"
            onClick={toggleVideo}
            className="rounded-full h-12 w-12"
            title={isVideoOff ? "Turn on camera" : "Turn off camera"}
          >
            {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
          </Button>

          <Button
            variant="secondary"
            size="icon"
            onClick={toggleFullscreen}
            className="rounded-full h-12 w-12"
            title="Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </Button>

          <Button
            variant="destructive"
            size="icon"
            onClick={handleEndCall}
            className="rounded-full h-12 w-12"
            title="End call"
          >
            <PhoneOff className="h-5 w-5" />
          </Button>
        </div>
        <div className="text-center text-gray-400 text-xs mt-2">
          Virtual Consultation
        </div>
      </div>
    </div>
  )
}

