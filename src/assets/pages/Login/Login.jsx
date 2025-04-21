import { useState } from "react";
import LoginForm from "./components/form";
import { message } from "antd";


const LoginPage = ({ setIsAuthenticated, setUserRole }) => {
  const [loading, setIsLoading] = useState(false);
  const onFinish = async (values) => {
    console.log(values);
    setIsLoading(true);
  }

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
