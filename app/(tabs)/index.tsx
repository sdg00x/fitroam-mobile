import { View, Text } from 'react-native'

export default function DiscoverScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0e0e0e', alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#c8ff57', fontSize: 28, fontWeight: '800' }}>FitRoam</Text>
      <Text style={{ color: '#666', fontSize: 14, marginTop: 8 }}>Find your gym anywhere</Text>
    </View>
  )
}