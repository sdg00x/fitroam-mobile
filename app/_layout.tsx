import React, { useEffect } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { UserProvider, useUserContext } from '../src/context/UserProvider'
import { ProfileProvider, useProfile } from '../src/hooks/useProfile'

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading: userLoading } = useUserContext()
  const { profile, loading: profileLoading } = useProfile()
  const router   = useRouter()
  const segments = useSegments()

  useEffect(() => {
    if (userLoading || profileLoading) return

    const first = segments[0] as string | undefined
    const inWelcome    = first === 'welcome'
    const inOnboarding = first === 'onboarding'

    console.log('[Gate]', {
      userId:    user?.id?.slice(0, 8),
      onboarded: profile.onboarded,
      segments:  segments.join('/'),
      inWelcome, inOnboarding,
    })

    if (!user) {
      if (!inWelcome) router.replace('/welcome')
      return
    }

    if (!profile.onboarded) {
      if (!inOnboarding) router.replace('/onboarding/city')
      return
    }

    if (inWelcome || inOnboarding) router.replace('/(tabs)/home')
  }, [user, userLoading, profile.onboarded, profileLoading, segments.join('/')])

  return <>{children}</>
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <UserProvider>
        <ProfileProvider>
          <AuthGate>
            <Stack screenOptions={{ headerShown: false }} />
          </AuthGate>
        </ProfileProvider>
      </UserProvider>
    </SafeAreaProvider>
  )
}
