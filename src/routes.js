import Index from "views/Index.js";
import Profile from "views/examples/ProfileManager/Profile";
import Register from "views/examples/Register.js";
import Login from "views/examples/Login.js";
import Roles from "views/examples/Roles";
import Icons from "views/examples/Icons.js";
import Service from "views/examples/ServicePackManager /Service";
import CreateService from "views/examples/ServicePackManager /CreateService";
import UpdateService from "views/examples/ServicePackManager /UpdateService";
import Category from "views/examples/CategoryManager/Category";
import CreateCategory from "views/examples/CategoryManager/CreateCategory";
import UpdateCategory from "views/examples/CategoryManager/UpdateCategory";
import Employer from "views/examples/EmployerManager/Employer";

var routes = [
  {
    path: "/index",
    name: "Dashboard",
    icon: "ni ni-tv-2 text-primary",
    component: <Index />,
    layout: "/admin",
  },
  {
    path: "/icons",
    name: "Icons",
    icon: "ni ni-planet text-blue",
    component: <Icons />,
    layout: "/admin",
  },
  {
    path: "/category",
    name: "Manager Category",
    icon: "ni ni-bullet-list-67 text-red",
    component: <Category />,
    layout: "/admin",
  },
  {
    path: "/service",
    name: "Manager Service",
    icon: "ni ni-bullet-list-67 text-red",
    component: <Service />,
    layout: "/admin",
  },
  {
    path: "/user-profile",
    name: "User Profile",
    icon: "ni ni-single-02 text-yellow",
    component: <Profile />,
    layout: "/admin",
  },
  {
    path: "/roles",
    name: "Manager Roles",
    icon: "ni ni-bullet-list-67 text-red",
    component: <Roles />,
    layout: "/admin",
  },
  {
    path: "/employer",
    name: "Manager Employer",
    icon: "ni ni-bullet-list-67 text-red",
    component: <Employer />,
    layout: "/admin",
  },
  {
    path: "/login",
    component: <Login />,
    layout: "/auth",
  },
  {
    path: "/register",
    component: <Register />,
    layout: "/auth",
  },
  {
    path: "/create-category",
    component: <CreateCategory />,
    layout: "/admin",
  },
  {
    path: "/update-category/:id",
    component: <UpdateCategory />,
    layout: "/admin",
  },
  {
    path: "/create-service",
    component: <CreateService />,
    layout: "/admin",
  },

  {
    path: "/update-service/:id",
    component: <UpdateService />,
    layout: "/admin",
  },
  
];

export default routes;
