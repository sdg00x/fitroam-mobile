import { Redirect } from 'expo-router'

// Root route. AuthGate (in _layout) handles the real routing decision
// once user + profile load; this just gives "/" something to match
// so expo-router doesn't render the Unmatched Route fallback on boot.
export default function Index() {
  return <Redirect href="/welcome" />
}
