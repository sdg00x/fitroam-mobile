import { Redirect } from 'expo-router'

// The tabs group needs a default screen. The pivot moved the old
// (tabs)/index.tsx out to results.tsx, leaving the group with no root —
// so navigating to bare /(tabs) hit the unmatched-route fallback.
// This redirects the group root to home.
export default function TabsIndex() {
  return <Redirect href="/(tabs)/home" />
}
