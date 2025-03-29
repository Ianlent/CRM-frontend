import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword, deleteUser } from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";


export const createEmployee = async (email, password, name, phone, role) => {
    try {
        // Create employee account in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
  
        // Store role in Firestore
        await setDoc(doc(db, "users", user.uid), {
            role: role,
            name: name,
            phone: phone,
        });
        console.log("Employee account created successfully")
        return user;
    } catch (error) {
        console.error("Error creating employee:", error.message);
        throw error;
    }
};
  // Delete an employee's account
export const updateEmployee = async (user, fieldName, newValue) => {
    try {
        if (!user) throw new Error("User not found");

        // Step 2: Remove user role from Firestore
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
            [fieldName]: newValue, // Dynamic field update
        });
        console.log(`Employee ${fieldName} updated successfully`);
    } catch (error) {
        console.error("Error updating employee field:", error.message);
        throw error;
    }
};

