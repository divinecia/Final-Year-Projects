import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const getIsMobile = () => {
    if (typeof window === 'undefined') return false
    return window.innerWidth < MOBILE_BREAKPOINT
  }
  
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    // Set initial value on mount (client-side only)
    setIsMobile(getIsMobile())
    
    const handleResize = () => setIsMobile(getIsMobile())
    window.addEventListener("resize", handleResize)
    
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return isMobile
}
