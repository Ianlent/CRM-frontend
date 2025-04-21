const logout = async () => {
    try {
        await setTimeout(console.log("Logging out..."), 2000);
        window.location.href = '/login';
    } catch (error) {
        console.error('Logout failed:', error);  
    }
}
export { logout };



