/** Foto bleibt als Datenadresse nur im lokalen Speicher. Nichts wird hochgeladen. */

export type PhotoSource = 'library' | 'camera';

export async function pickLocalPhoto(source: PhotoSource = 'library'): Promise<string | 'cancel' | 'big' | 'denied'> {
  try {
    const ImagePicker = await import('expo-image-picker');
    if (source === 'camera') {
      const current = await ImagePicker.getCameraPermissionsAsync();
      if (!current.granted) {
        const asked = await ImagePicker.requestCameraPermissionsAsync();
        if (!asked.granted) return 'denied';
      }
    }
    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({ quality: 0.4, base64: true })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.4, base64: true });
    if (result.canceled || !result.assets[0]?.base64) return 'cancel';
    const data = `data:image/jpeg;base64,${result.assets[0].base64}`;
    if (data.length > 1_400_000) return 'big';
    return data;
  } catch {
    return 'cancel';
  }
}
