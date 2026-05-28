import { Stack } from 'expo-router'

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="city" />
      <Stack.Screen name="style" />
      <Stack.Screen name="priorities" />
    </Stack>
  )
}
