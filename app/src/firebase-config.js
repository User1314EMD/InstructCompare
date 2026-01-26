/**
 * Конфигурация Firebase. Замените на свои значения из консоли:
 * https://console.firebase.google.com → проект → Настройки → Ваши приложения
 */
export const firebaseConfig = {
  apiKey: "AIzaSyAYecNogrFbbwZM-Vem1fntEcgCgf0fE8c",
  authDomain: "instructcompare.firebaseapp.com",
  projectId: "instructcompare",
  storageBucket: "instructcompare.firebasestorage.app",
  messagingSenderId: "957974898782",
  appId: "1:957974898782:web:d97023aa9103f916d92ccf"
}

export const isFirebaseConfigured = () =>
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== 'YOUR_API_KEY' &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== 'your-project-id'
