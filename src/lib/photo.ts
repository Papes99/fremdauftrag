/** Foto bleibt als Datenadresse nur im lokalen Speicher. Nichts wird hochgeladen. */
export async function pickLocalPhoto(): Promise<string | 'cancel' | 'big'> {
  try {
    const ImagePicker = await import('expo-image-picker');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.4,
      base64: true,
    });
    if (result.canceled || !result.assets[0]?.base64) return 'cancel';
    const data = `data:image/jpeg;base64,${result.assets[0].base64}`;
    if (data.length > 1_400_000) return 'big';
    return data;
  } catch {
    return 'cancel';
  }
}
