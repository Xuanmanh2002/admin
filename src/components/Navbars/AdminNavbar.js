import React, { useContext, useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  DropdownToggle,
  Media,
  Navbar,
  Nav,
  Container,
} from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "components/Auth/AuthProvider";
import { checkRoleAdmin, getNotificationsByRole } from "components/utils/ApiFunctions";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';

const AdminNavbar = (props) => {
  const { handleLogout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState({
    firstName: "",
    lastName: "",
    avatar: "",
    roles: [{ id: "", name: "" }],
  });
  const [notifications, setNotifications] = useState([]); 
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchAdminData = () => {
      const storedFirstName = localStorage.getItem("firstName");
      const storedLastName = localStorage.getItem("lastName");
      const storedAvatar = localStorage.getItem("avatar");

      setAdmin((prevAdmin) => ({
        ...prevAdmin,
        firstName: storedFirstName || "",
        lastName: storedLastName || "",
        avatar: storedAvatar || "",
      }));
    };

    const fetchNotifications = async () => {
      try {
        const data = await getNotificationsByRole();
        setNotifications(data); 
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    if (!token) {
      handleLogout();
      navigate("/auth/login", {
        state: { message: "Token expired. Please log in again." },
      });
      return;
    }

    fetchAdminData();

    const verifyRole = async () => {
      try {
        const isAdmin = await checkRoleAdmin(token);
        if (!isAdmin) {
          navigate("/auth/login", {
            state: { message: "Access restricted to admins only!" },
          });
        }
      } catch (error) {
        console.error("Error checking role:", error);
        navigate("/auth/login", {
          state: { message: "An error occurred. Please try again." },
        });
      }

      setLoading(false);
    };

    verifyRole();
    fetchNotifications(); 
  }, [navigate, handleLogout, token]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleLogoutClick = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminId");
    handleLogout();
    navigate("/auth/login", { state: { message: "You have been logged out!" } });
  };

  return (
    <>
      <Navbar className="navbar-top navbar-dark" expand="md" id="navbar-main">
        <Container fluid>
          <Link
            className="h4 mb-0 text-white text-uppercase d-none d-lg-inline-block"
            to="/"
          >
            {props.brandText}
          </Link>
          <Nav className="align-items-center d-none d-md-flex" navbar>
            <UncontrolledDropdown nav>
              <DropdownToggle className="text-white" nav>
                <FontAwesomeIcon icon={faBell} size="lg" />
              </DropdownToggle>
              <DropdownMenu className="dropdown-menu-arrow" right>
                <DropdownItem className="noti-title" header tag="div">
                  <h6 className="text-overflow m-0">Notifications</h6>
                </DropdownItem>
                {notifications.length > 0 ? (
                  notifications.map((notification, index) => (
                    <DropdownItem key={index}>
                      <i className="ni ni-bell-55" />
                      <span>{notification.message}</span>
                    </DropdownItem>
                  ))
                ) : (
                  <DropdownItem className="text-center text-muted">
                    No notifications
                  </DropdownItem>
                )}
                <DropdownItem divider />
                <DropdownItem className="text-center text-muted" disabled>
                  View all notifications
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
            <UncontrolledDropdown nav>
              <DropdownToggle className="pr-0" nav>
                <Media className="align-items-center">
                  <span className="avatar avatar-sm rounded-circle">
                    <img
                      alt="Avatar"
                      src={
                        admin.avatar
                          ? `data:image/jpeg;base64,${admin.avatar}`
                          : require("../../assets/img/theme/team-4-800x800.jpg")
                      }
                    />
                  </span>
                  <Media className="ml-2 d-none d-lg-block">
                    <span className="mb-0 text-sm font-weight-bold">
                      {admin.firstName} {admin.lastName}
                    </span>
                  </Media>
                </Media>
              </DropdownToggle>
              <DropdownMenu className="dropdown-menu-arrow" right>
                <DropdownItem className="noti-title" header tag="div">
                  <h6 className="text-overflow m-0">Welcome!</h6>
                </DropdownItem>
                <DropdownItem to="/admin/user-profile" tag={Link}>
                  <i className="ni ni-single-02" />
                  <span>My profile</span>
                </DropdownItem>
                <DropdownItem divider />
                <DropdownItem
                  href="#pablo"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLogoutClick();
                  }}
                >
                  <i className="ni ni-user-run" />
                  <span>Logout</span>
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          </Nav>
        </Container>
      </Navbar>
    </>
  );
};

export default AdminNavbar;
