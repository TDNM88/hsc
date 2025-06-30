// pages/_app.tsx
import type { AppProps } from "next/app"
import { useEffect, useState } from "react"
import "../styles/globals.css"
import { Toaster } from "@/components/ui/toaster"
import { Loader2 } from "lucide-react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth-context"

function MyApp({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false)

  // Set mounted to true on component mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render anything until the component is mounted
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }


  
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <TooltipProvider>
          <Component {...pageProps} />
          <Toaster position="top-right" />
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default MyApp
