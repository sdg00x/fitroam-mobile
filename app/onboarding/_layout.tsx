import { Stack } from 'expo-router'

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="style" />
      <Stack.Screen name="facilities" />
      <Stack.Screen name="lifestyle" />
      <Stack.Screen name="budget" />
      <Stack.Screen name="priorities" />
    </Stack>
  )
}