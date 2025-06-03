import { Input } from "antd";
import { useEffect } from "react";
import { useSelector } from "react-redux";


const { Search } = Input;
const onSearch = (value, _e, info) => console.log(info?.source, value);
const Navbar = () => {
    const { user } = useSelector((state) => state.auth);

    return (
        <div>
            <div className="fixed h-[10vh] w-full bg-white top-0 flex items-center justify-between z-50">
                <img className="h-full" src="/logo.png" alt="" />
                <div className="w-full h-full flex items-center justify-between">
                    <Search
                        placeholder="Search"
                        allowClear
                        onSearch={onSearch}
                        style={{
                            width: 280,
                        }}
                    />
                    <div className="h-full flex items-center mr-1">
                        <p className="m-0">{user.username}</p>
                        <img className="h-[80%]" src="/default-profile.jpg" alt="" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Navbar