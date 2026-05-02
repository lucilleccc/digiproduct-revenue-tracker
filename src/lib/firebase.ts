import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
const firebaseConfig = {
  apiKey: "AIzaSyBADQ0H-j5Nz04cd2QVdsvk8RUQvsaJ3dU",
  authDomain: "gen-lang-client-0240666376.firebaseapp.com",
  projectId: "gen-lang-client-0240666376",
  storageBucket: "gen-lang-client-0240666376.firebasestorage.app",
  messagingSenderId: "501624201666",
  appId: "1:501624201666:web:70a5b3156767c61433b65b"
};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signIn = () => signInWithPopup(auth, googleProvider);
export const signOut = () => auth.signOut();

// Connection test
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();
