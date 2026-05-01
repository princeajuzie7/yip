import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

let permissionRequested = false;

export async function ensureNotificationPermission(): Promise<boolean> {
  if (permissionRequested) {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  }

  permissionRequested = true;
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  return true;
}

export async function notifyProductLimitReached(): Promise<void> {
  const isAllowed = await ensureNotificationPermission();

  if (!isAllowed) {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Catalog Full',
      body: 'You have reached the 5-product limit in Yip.',
    },
    trigger: null,
  });
}
