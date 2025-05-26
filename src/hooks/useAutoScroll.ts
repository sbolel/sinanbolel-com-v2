import { useEffect } from 'react'

const useAutoScroll = <T>(
  dependency: T,
  ref: React.RefObject<HTMLDivElement>
) => {
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth' })
  }, [dependency])
}

export default useAutoScroll
