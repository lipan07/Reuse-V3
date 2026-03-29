import Echo from 'laravel-echo';
import Pusher from 'pusher-js/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  REVERB_APP_KEY,
  REVERB_HOST,
  REVERB_CLUSTER,
  REVERB_PORT,
  REVERB_SCHEME,
  API_URL,
  BASE_URL,
} from '@env';

const g = typeof global !== 'undefined' ? global : typeof window !== 'undefined' ? window : {};
g.Pusher = Pusher;

/** Set EXPO_PUBLIC_REVERB_DEBUG=1 or REVERB_DEBUG=1 in .env to log WebSocket subscribe/bind traffic in Metro. */
const DEBUG_REVERB = typeof process !== 'undefined' && process.env && (
  process.env.REVERB_DEBUG === '1' ||
  process.env.EXPO_PUBLIC_REVERB_DEBUG === '1'
);

export const createEcho = async () => {
  if (typeof __DEV__ !== 'undefined' && __DEV__ && DEBUG_REVERB) {
    Pusher.logToConsole = true;
  }
  const token = await AsyncStorage.getItem('authToken');
  console.log('REVERB_HOST', REVERB_HOST);
  console.log('REVERB_PORT', REVERB_PORT);
  console.log('REVERB_SCHEME', REVERB_SCHEME);
  console.log('REVERB_APP_KEY', REVERB_APP_KEY);
  const apiBase = (
    API_URL ||
    (BASE_URL ? String(BASE_URL).replace(/\/api\/?$/, '') : '') ||
    ''
  ).replace(/\/$/, '');
  if (!apiBase) {
    console.error('[Echo] Missing API_URL (or BASE_URL) in .env — set API_URL=https://your-domain.tld');
  }
  // Auth hits Laravel (HTTPS), not Reverb. Reverb only handles WebSockets.
  const authEndpoint = `${apiBase}/broadcasting/auth`;
  console.log(
    '[Echo] authEndpoint',
    authEndpoint,
    '| ws',
    `${REVERB_SCHEME === 'https' ? 'wss' : 'ws'}://${REVERB_HOST}:${REVERB_PORT}`
  );
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
    authEndpoint,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    },
  });
};
