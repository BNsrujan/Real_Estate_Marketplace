
const SideBar2 = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="w-[400px] bg-white/90 backdrop-blur-sm p-5 rounded-lg shadow-lg">
            {children}
        </div>
    )
}

export default SideBar2