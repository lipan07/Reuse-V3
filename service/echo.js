import Echo from 'laravel-echo';
import Pusher from 'pusher-js/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { REVERB_APP_KEY, REVERB_HOST, REVERB_CLUSTER, REVERB_PORT, REVERB_SCHEME } from '@env';

window.Pusher = Pusher;

export const createEcho = async () => {
  const token = await AsyncStorage.getItem('authToken');
  // authEndpoint: `${REVERB_SCHEME}://${REVERB_HOST}/broadcasting/auth`,
  console.log('REVERB_HOST', REVERB_HOST);
  console.log('REVERB_PORT', REVERB_PORT);
  console.log('REVERB_SCHEME', REVERB_SCHEME);
  console.log('REVERB_APP_KEY', REVERB_APP_KEY);
  console.log('REVERB_CLUSTER', REVERB_CLUSTER);
  console.log('url', `https://${REVERB_HOST}::${REVERB_PORT}/broadcasting/auth`,);  
  return new Echo({
    broadcaster: 'reverb',
    key: REVERB_APP_KEY,
    cluster: REVERB_CLUSTER,
    wsHost: REVERB_HOST,
    wsPort: Number(REVERB_PORT),
    wssPort: Number(REVERB_PORT),
    forceTLS: REVERB_SCHEME === 'https',
    disableStats: true,
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `https://${REVERB_HOST}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });
};
