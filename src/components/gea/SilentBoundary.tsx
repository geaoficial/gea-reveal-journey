import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}
interface State {
  hasError: boolean;
}

/** Silent, cinematic error boundary — never shows a white screen. */
export class SilentBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(): State {
    return { hasError: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    if (typeof console !== "undefined") console.error("[GEA boundary]", error, info);
  }
  render() {
    if (this.state.hasError) return this.props.fallback ?? null;
    return this.props.children;
  }
}
