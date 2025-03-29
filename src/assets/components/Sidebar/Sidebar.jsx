import { useNavigate } from 'react-router'
import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faHouse, faUsersGear, faUsersViewfinder, faHandHoldingDollar, faArrowRightFromBracket, faListCheck} from '@fortawesome/free-solid-svg-icons'
import { logout } from '../../services/authService'
import { message } from 'antd'


const Sidebar = () => {
    const [isExpanded, setIsExpanded] = useState(false)
    const expand = () => {
        setIsExpanded(true)
    }
    const close = () => {
        setIsExpanded(false)
    }
    const barData = [
        {
            icon: faHouse,
            text: "Dashboard",
            linkTo: "dashboard",
            isExpanded: isExpanded,
            isActive: location.pathname === "/admin/dashboard",
        },
        {
            icon: faUsersGear,
            text: "Employee Management",
            linkTo: "employee-management",
            isExpanded: isExpanded,
            isActive: location.pathname === "/admin/employee-management",
        },
        {
            icon: faUsersViewfinder,
            text: "Customer Management",
            linkTo: "customer-management",
            isExpanded: isExpanded,
            isActive: location.pathname === "/admin/customer-management",
        },
        {
            icon: faHandHoldingDollar,
            text: "Financial Management",
            linkTo: "financial-management",
            isExpanded: isExpanded,
            isActive: location.pathname === "/admin/financial-management",
        },
        {
            icon: faListCheck,
            text: "Order Management",
            linkTo: "order-management",
            isExpanded: isExpanded,
            isActive: location.pathname === "/admin/order-management"
        },
        {
            icon: faArrowRightFromBracket,
            text: "Logout",
            linkTo: "/login",
            isExpanded: isExpanded,
        }
    ];

    return(
        <div>
            <div className="h-[90vh] mt-[10vh] pt-[1%] bg-[#091D34] fixed top-0 left-0 text-base flex flex-col items-center transition-[width] duration-300 z-50 w-12 hover:w-60" onMouseEnter={expand} onMouseLeave={close}>
                <div className='h-full w-full flex flex-col items-start justify-start px-1 overflow-hidden text-white '>
                    {barData.filter(item => item.linkTo != '/login').map((item, index) => (
                        <SidebarLink key={index} {...item} />
                    ))}
                </div>
                <div className='w-full px-1 overflow-hidden text-red-500'>
                    <SidebarLink key={'logout'} {...barData[barData.length-1]}/>
                </div>                
            </div>
        </div>
    )
}

const SidebarLink = ({icon, text, linkTo, isExpanded, isActive }) => {
    const navigate = useNavigate();
    const redirect = async () => {
        try {
            if (linkTo === '/login') {
                await logout();
                localStorage.removeItem("token");
                window.location.reload();
            } else {
                navigate(linkTo)
            }
        } catch (error) {
            message.error("Logout failed");
        }
        
    }
    return(
        <div className={`cursor-pointer w-[90%] mb-1 border-none rounded-lg text-left transition-[padding] duration-100 flex flex-col pl-1 py-2 hover:pl-5 ${isActive ? 'bg-[#59708a5d]':''} ${isExpanded ? 'ml-1.5' : ''}`} onClick={redirect}>
            <div className='flex flex-row items-center no-underline whitespace-nowrap px-0.5'>
                <FontAwesomeIcon className='py-1' icon={icon} />
                {isExpanded && <span className='ml-2.5 text-sm'>{text}</span>}
            </div>
        </div>
        
    )
}


export default Sidebar