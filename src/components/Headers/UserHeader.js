import React, { useEffect, useState } from "react";
import { Button, Container, Row, Col } from "reactstrap";
import { getAdmin } from "components/utils/ApiFunctions";

const UserHeader = () => {
  const [admin, setAdmin] = useState({
    email: "",
    firstName: "",
    lastName: "",
    birthDate: "",
    avatar: "",
    gender: "",
    telephone: "",
    address: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const email = localStorage.getItem("email");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const adminData = await getAdmin(email, token);
        setAdmin(adminData);
      } catch (error) {
        console.error(error);
        setErrorMessage("Error fetching admin data");
      }
    };

    if (email && token) {
      fetchAdminData();
    } else {
      setErrorMessage("User not logged in");
    }
  }, [email, token]);
  return (
    <>
      <div
        className="header pb-8 pt-5 pt-lg-8 d-flex align-items-center"
        style={{
          minHeight: "600px",
          backgroundImage: `url(${admin.avatar
              ? `data:image/jpeg;base64,${admin.avatar}`
              : require("../../assets/img/theme/profile-cover.jpg")
            })`,
          backgroundSize: "cover",
          backgroundPosition: "center top",
        }}
      >
        <span className="mask bg-gradient-default opacity-8" />
        <Container className="d-flex align-items-center" fluid>
          <Row>
            <Col lg="7" md="10">
              <h1 className="display-2 text-white">Hello {admin.lastName}</h1>
              <p className="text-white mt-0 mb-5">
                This is your profile page. You can see the progress you've made
                with your work and manage your projects or assigned tasks
              </p>
              <Button
                color="info"
                href="#pablo"
                onClick={(e) => e.preventDefault()}
              >
                Edit profile
              </Button>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default UserHeader;
