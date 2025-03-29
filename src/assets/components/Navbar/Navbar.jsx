import { Input } from "antd";
const { Search } = Input;
const onSearch = (value, _e, info) => console.log(info?.source, value);
const Navbar = () => {
    return(
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
                        <p>Admin</p>
                        <img className="h-[80%]" src="/default-profile.jpg" alt="" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Navbar