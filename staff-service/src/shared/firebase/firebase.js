import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: 'AIzaSyAZmPJ36P4ZvhH5s24ygcqs-L3Y86MxGoU',
  authDomain: 'architecturepatterns-d92c3.firebaseapp.com',
  projectId: 'architecturepatterns-d92c3',
  storageBucket: 'architecturepatterns-d92c3.firebasestorage.app',
  messagingSenderId: '375783130162',
  appId: '1:375783130162:web:5b9125de68b864cd2ee82b',
  measurementId: 'G-LEKHE5B40Z',
};

const app = initializeApp(firebaseConfig);

export const messaging = getMessaging(app);
