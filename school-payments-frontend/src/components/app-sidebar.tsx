import { Link, useNavigate } from "react-router-dom"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarFooter,
} from "@/components/ui/sidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ModeToggle } from "@/components/ModeToggle"
import { Calendar, Inbox, Search, User2, ChevronUp, LogOut } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { logout } from "@/redux/slices/userSlices"
import { toast } from "@/components/ui/sonner"

const items = [
    { title: "Transactions", url: "/transactions", icon: Inbox },
    { title: "Payments", url: "/payments", icon: Calendar },
    { title: "Analytics", url: "/analytics", icon: Search },
]

export function AppSidebar() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state: any) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        toast.success("Logged out successfully");
        navigate('/');
    }

    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link to={item.url}>
                                            <item.icon className="mr-2 h-4 w-4" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="flex flex-row align-middle">
                {/* Theme Toggle */}
                <div className="flex justify-center p-2">
                    <ModeToggle />
                </div>
                
                {/* User Dropdown */}
                <SidebarMenu className="item-center my-auto flex-1">
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton>
                                    <User2 className="mr-2 h-4 w-4" /> 
                                    {user?.name || "User"}
                                    <ChevronUp className="ml-auto" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                side="top"
                                className="w-[--radix-popper-anchor-width]"
                            >
                                <DropdownMenuItem>
                                    <User2 className="mr-2 h-4 w-4" />
                                    <span>Account</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <span>Billing</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleLogout}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Sign out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}