// hooks/useOnClickOutside.js
import { useEffect } from 'react'

export const useOnClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return
      }
      
      // Check if we clicked on a link - if so, don't close yet
      const clickedElement = event.target
      const isLink = clickedElement.closest('a')
      
      if (isLink) {
        // Delay to allow navigation
        setTimeout(() => handler(event), 150)
      } else {
        handler(event)
      }
    }

    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)

    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, handler])
}