import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Form,
  Input,
  Container,
  Row,
  Col,
} from "reactstrap";
import UserHeader from "components/Headers/UserHeader.js";
import { getAdmin, updateAdmin } from "components/utils/ApiFunctions"; // Ensure updateAdmin is imported
import { format } from "date-fns";
import { FaEdit } from "react-icons/fa";

const Profile = () => {
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
  const [successMessage, setSuccessMessage] = useState(""); // New state for success message
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdmin((prevAdmin) => ({
          ...prevAdmin,
          avatar: file,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    document.getElementById("avatar-upload").click();
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) return null; // Check if the date is valid
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const formattedBirthDate = () => {
    if (!admin.birthDate) return "";
    const birth = new Date(admin.birthDate);
    return isNaN(birth.getTime()) ? "" : format(birth, "yyyy-MM-dd");
  };

  const age = calculateAge(admin.birthDate);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAdmin((prevAdmin) => ({
      ...prevAdmin,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateAdmin(
        admin.email,
        admin.firstName,
        admin.lastName,
        admin.gender,
        admin.avatar,
        admin.address,
        admin.telephone,
        admin.birthDate
      );
      setErrorMessage("");
      setSuccessMessage("Profile updated successfully!"); // Set success message
    } catch (error) {
      setErrorMessage(error.message);
      setSuccessMessage(""); // Clear success message on error
    }
  };

  return (
    <>
      <UserHeader />
      <Container className="mt--7" fluid>
        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
        {successMessage && <div className="alert alert-success">{successMessage}</div>}
        <Row>
          <Col className="order-xl-2 mb-5 mb-xl-0" xl="4">
            <Card className="card-profile shadow">
              <Row className="justify-content-center">
                <Col className="order-lg-2" lg="3">
                  <div className="card-profile-image" style={{ position: "relative" }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: "none" }}
                      id="avatar-upload"
                    />
                    <label htmlFor="avatar-upload" style={{ cursor: "pointer" }}>
                      <img
                        alt="Avatar"
                        className="rounded-circle"
                        src={
                          admin.avatar
                            ? `data:image/jpeg;base64,${admin.avatar}`
                            : require("../../../assets/img/theme/team-4-800x800.jpg")
                        }
                        style={{ width: "150px", height: "150px", objectFit: "cover" }}
                      />
                    </label>
                    <FaEdit
                      onClick={triggerFileInput}
                      style={{
                        position: "absolute",
                        top: "80px",
                        right: "1px",
                        cursor: "pointer",
                        color: "black",
                        backgroundColor: "white",
                        borderRadius: "50%",
                        padding: "7px",
                        fontSize: "2rem",
                      }}
                    />
                  </div>
                </Col>
              </Row>
              <CardHeader className="text-center border-0 pt-8 pt-md-4 pb-0 pb-md-4">
                <div className="d-flex justify-content-between">
                  <Button
                    className="mr-4"
                    color="info"
                    href="#pablo"
                    onClick={(e) => e.preventDefault()}
                    size="sm"
                  >
                    Connect
                  </Button>
                  <Button
                    className="float-right"
                    color="default"
                    href="#pablo"
                    onClick={(e) => e.preventDefault()}
                    size="sm"
                  >
                    Message
                  </Button>
                </div>
              </CardHeader>
              <CardBody className="pt-0 pt-md-4">
                <Row>
                  <div className="col">
                    <div className="card-profile-stats d-flex justify-content-center mt-md-5"></div>
                  </div>
                </Row>
                <div className="text-center">
                  <h3>
                    {admin.firstName} {admin.lastName}
                    <span className="font-weight-light">, {age !== null ? age : "N/A"}</span>
                  </h3>
                  <div className="h5 font-weight-300">
                    <i className="ni location_pin mr-2" />
                    {admin.address}
                  </div>
                  <a href="#pablo" onClick={(e) => e.preventDefault()}>
                    Show more
                  </a>
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col className="order-xl-1" xl="8">
            <Card className="bg-secondary shadow">
              <CardHeader className="bg-white border-0">
                <Row className="align-items-center">
                  <Col xs="8">
                    <h3 className="mb-0">My account</h3>
                  </Col>
                  <Col className="text-right" xs="4">
                    <Button
                      color="primary"
                      onClick={handleSubmit}
                      size="sm"
                    >
                      Update
                    </Button>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody>
                <Form onSubmit={handleSubmit}>
                  <h6 className="heading-small text-muted mb-4">User information</h6>
                  <div className="pl-lg-4">
                    <Row>
                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label" htmlFor="input-email">
                            Email
                          </label>
                          <Input
                            className="form-control-alternative"
                            id="input-email"
                            value={admin.email} // Make it a controlled input
                            type="email"
                            readOnly
                          />
                        </FormGroup>
                      </Col>
                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label" htmlFor="input-gender">
                            Gender
                          </label>
                          <Input
                            className="form-control-alternative"
                            name="gender"
                            value={admin.gender}
                            onChange={handleInputChange}
                            id="input-gender"
                            type="text"
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label" htmlFor="input-first-name">
                            First name
                          </label>
                          <Input
                            className="form-control-alternative"
                            name="firstName"
                            value={admin.firstName}
                            onChange={handleInputChange}
                            id="input-first-name"
                            type="text"
                          />
                        </FormGroup>
                      </Col>
                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label" htmlFor="input-last-name">
                            Last name
                          </label>
                          <Input
                            className="form-control-alternative"
                            name="lastName"
                            value={admin.lastName}
                            onChange={handleInputChange}
                            id="input-last-name"
                            type="text"
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label" htmlFor="input-telephone">
                            Telephone
                          </label>
                          <Input
                            className="form-control-alternative"
                            name="telephone"
                            value={admin.telephone}
                            onChange={handleInputChange}
                            id="input-telephone"
                            type="text"
                          />
                        </FormGroup>
                      </Col>
                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label" htmlFor="input-birth-date">
                            Birth date
                          </label>
                          <Input
                            className="form-control-alternative"
                            name="birthDate"
                            value={formattedBirthDate()} // Use formatted birth date
                            onChange={handleInputChange}
                            id="input-birth-date"
                            type="date"
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg="6">
                        <FormGroup>
                          <label className="form-control-label" htmlFor="input-address">
                            Address
                          </label>
                          <Input
                            className="form-control-alternative"
                            name="address"
                            value={admin.address}
                            onChange={handleInputChange}
                            id="input-address"
                            type="text"
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                  </div>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Profile;
