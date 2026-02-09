import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { firebaseConfig, isFirebaseConfigured } from './firebase-config'

let db = null
if (isFirebaseConfigured()) {
  try {
    initializeApp(firebaseConfig)
    db = getFirestore()
  } catch (e) {
    db = null
  }
}

export { db }
