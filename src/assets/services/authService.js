import { auth, db } from "./firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, deleteUser, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// Fetch user role from Firestore
export const getUserRole = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return userDoc.data().role;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user role:", error.message);
    throw error;
  }
};

// Login function with Firestore role retrieval
export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    let role = await getUserRole(user.uid);

    // If no role exists, assume first user and assign "admin"
 

    return { user, role };
  } catch (error) {
    console.error("Login Error:", error.message);
    throw error;
  }
};

// Logout function
export const logout = async () => {
  try {
    await signOut(auth);
    if (localStorage.get("token")) {
      localStorage.removeItem("token")
    };
  } catch (error) {
    console.error("Logout Error:", error.message);
  }
};



