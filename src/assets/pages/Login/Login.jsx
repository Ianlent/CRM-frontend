import { useState, useEffect } from "react";
import LoginForm from "./components/form";
import { message } from "antd";
import { getAuth, signInWithEmailAndPassword, setPersistence, browserLocalPersistence, onAuthStateChanged } from "firebase/auth";
import { getUserRole } from "../../services/authService"; // Import your custom hook or function

const auth = getAuth();

const LoginPage = ({ setIsAuthenticated, setUserRole }) => {
  const [loading, setIsLoading] = useState(false);

  const onFinish = async (values) => {
    setIsLoading(true);
    try {
      await setPersistence(auth, browserLocalPersistence);
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;
      const idToken = await user.getIdToken();

      message.success(`Login successful`);

      // Fetch role from Firestore or backend
      const role = await getUserRole(user.uid);
      setUserRole(role);

      localStorage.setItem("token", JSON.stringify({
        token: idToken,
        expiration: Date.now() + 24 * 60 * 60 * 1000,
      }));

      setIsAuthenticated(true);
    } catch (error) {
      message.error("Invalid credentials, please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen max-h-screen m-0 bg-cover bg-no-repeat flex flex-col justify-center items-center"
      style={{ backgroundImage: "linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.5)), url(background.jpg)" }}>
      <div className="h-[75vh] w-[30vw] bg-transparent flex flex-col justify-start items-center max-[800px]:w-[75vw]">
        <p className="text-white text-[5vh] m-0">Welcome</p>
        <div className="bg-white h-full w-full mt-2.5 flex flex-col items-center justify-start rounded-md max-[800px]:text-[25px] ">
          <p className="text-2xl m-7">
            <b>Log in</b>
          </p>
          <LoginForm onFinish={onFinish} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
