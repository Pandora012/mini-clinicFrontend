import { useState } from "react";
import { useLocation, Outlet } from "react-router-dom";
import { Breadcrumb } from "react-bootstrap";
import AppNavbar from "../components/layout/AppNavbar.jsx";
import Sidebar from "../components/layout/Sidebar.jsx";

const MainLayout = ({}) => {
  const [sidebarShow, setSidebarShow] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setSidebarShow(!sidebarShow);

  const getBreadcrumbItems = () => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const items = [{ label: "Home", path: "/" }];

    pathSegments.forEach((segment, index) => {
      const path = "/" + pathSegments.slice(0, index + 1).join("/");
      const label = segment.charAt(0).toUpperCase() + segment.slice(1);
      items.push({ label, path });
    });

    return items;
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <AppNavbar toggleSidebar={toggleSidebar} />
      <div className="d-flex flex-grow-1">
        <Sidebar show={sidebarShow} handleClose={() => setSidebarShow(false)} isDesktop={true} />
        <Sidebar show={sidebarShow} handleClose={() => setSidebarShow(false)} isDesktop={false} />
        <main className="flex-grow-1 bg-light">
          <div className="container-fluid p-4">
            <Breadcrumb className="mb-4">
              {getBreadcrumbItems().map((item, index) => (
                <Breadcrumb.Item key={index} active={index === getBreadcrumbItems().length - 1} href={item.path}>
                  {item.label}
                </Breadcrumb.Item>
              ))}
            </Breadcrumb>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
