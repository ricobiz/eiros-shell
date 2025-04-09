
import * as React from "react"

const MOBILE_BREAKPOINT = 768

// Original function without parameters
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

// New function with query parameter
export function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState<boolean>(false)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    
    const handleChange = () => {
      setMatches(mediaQuery.matches)
    }
    
    // Set initial value
    handleChange()
    
    // Watch for changes
    mediaQuery.addEventListener("change", handleChange)
    
    // Clean up
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [query])

  return matches
}
