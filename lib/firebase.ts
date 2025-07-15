import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDqrwRvK8417LQ3cnIGAw1G4quz3ZtL_QE",
  authDomain: "the-breadcrumb-project.firebaseapp.com",
  databaseURL: "https://the-breadcrumb-project-default-rtdb.firebaseio.com",
  projectId: "the-breadcrumb-project",
  storageBucket: "the-breadcrumb-project.firebasestorage.app",
  messagingSenderId: "411590769546",
  appId: "1:411590769546:web:4b54e5b40c2d66e68e2673",
  measurementId: "G-LWCCCP7315"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app; 