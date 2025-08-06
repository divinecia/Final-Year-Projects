"use client"

import * as React from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface ErrorBoundaryProps extends React.PropsWithChildren {
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
  onError?: (error: Error) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

/**
 * ErrorBoundary class component to catch JavaScript errors in child components.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  static displayName = "ErrorBoundary"

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error and stack trace
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.props.onError?.(error)
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback ?? DefaultErrorFallback
      return <FallbackComponent error={this.state.error} resetError={this.resetError} />
    }
    return this.props.children
  }
}

interface DefaultErrorFallbackProps {
  error?: Error
  resetError: () => void
}

/**
 * Default fallback UI for ErrorBoundary.
 */
const DefaultErrorFallback: React.FC<DefaultErrorFallbackProps> = ({ error, resetError }) => (
  <Card className="w-full max-w-md mx-auto mt-8">
    <CardHeader className="text-center">
      <div className="flex justify-center mb-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
      </div>
      <CardTitle>Something went wrong</CardTitle>
      <CardDescription>
        {error?.message || "An unexpected error occurred"}
      </CardDescription>
    </CardHeader>
    <CardContent className="text-center">
      <Button onClick={resetError} className="w-full">
        <RefreshCw className="mr-2 h-4 w-4" />
        Try again
      </Button>
    </CardContent>
  </Card>
)
DefaultErrorFallback.displayName = "DefaultErrorFallback"

/**
 * Hook for functional components to capture and reset errors.
 */
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => setError(null), [])
  const captureError = React.useCallback((err: Error) => setError(err), [])

  React.useEffect(() => {
    if (error) throw error
  }, [error])

  return { captureError, resetError }
}
