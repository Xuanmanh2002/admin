import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { updateService, checkRoleAdmin } from "components/utils/ApiFunctions";
import { Button, Form, FormGroup, Input, Container, Row, Col, Card, CardBody, CardHeader } from "reactstrap";
import Header from "components/Headers/Header.js";

const UpdateService = () => {
    const { id } = useParams();
    const location = useLocation();
    const service = location.state || {};
    
    const [updatedService, setUpdatedService] = useState({
        serviceName: service.serviceName || "",
        price: service.price || "",
        quantity: service.quantity || "",
        validityPeriod: service.validityPeriod || "",
        description: service.description || "",
    });
    
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    
    const navigate = useNavigate();
    
    useEffect(() => {
        const checkAdminRole = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                const result = await checkRoleAdmin(token);
                setIsAdmin(result);
                if (!result) {
                    setErrorMessage("Access restricted to admins only.");
                    navigate("/auth/login");
                }
            } else {
                setErrorMessage("No token found. Please log in as an admin.");
                navigate("/auth/login");
            }
        };
        checkAdminRole();
    }, [navigate]);
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUpdatedService({ ...updatedService, [name]: value });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isAdmin) return;
    
        try {
            const success = await updateService(
                id, 
                updatedService.serviceName, 
                updatedService.price,
                updatedService.quantity, 
                updatedService.validityPeriod, 
                updatedService.description
            );
            if (success) {
                setSuccessMessage("Service updated successfully!");
                setErrorMessage("");
                navigate("/admin/service");  
            } else {
                setErrorMessage("Failed to update service.");
            }
        } catch (error) {
            setErrorMessage(error.message);
        }
    };
    
    return (
        <>
            <Header />
            <Container className="mt--7" fluid>
                <Row>
                    <Col>
                        <Card className="shadow">
                            <CardHeader className="border-0">
                                <h3 className="mb-0">Update Service</h3>
                            </CardHeader>
                            <CardBody>
                                <Form onSubmit={handleSubmit}>
                                    {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
                                    {successMessage && <div className="alert alert-success">{successMessage}</div>}
                                    <FormGroup>
                                        <label htmlFor="serviceName">Service Name</label>
                                        <Input
                                            type="text"
                                            id="serviceName"
                                            name="serviceName"
                                            value={updatedService.serviceName}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <label htmlFor="price">Price</label>
                                        <Input
                                            type="number"
                                            id="price"
                                            name="price"
                                            value={updatedService.price}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <label htmlFor="quantity">Quantity</label>
                                        <Input
                                            type="number"
                                            id="quantity"
                                            name="quantity"
                                            value={updatedService.quantity}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <label htmlFor="validityPeriod">Validity Period</label>
                                        <Input
                                            type="text"
                                            id="validityPeriod"
                                            name="validityPeriod"
                                            value={updatedService.validityPeriod}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <label htmlFor="description">Description</label>
                                        <Input
                                            type="text"
                                            id="description"
                                            name="description"
                                            value={updatedService.description}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </FormGroup>
                                    <Button type="submit" color="primary">Update Service</Button>
                                </Form>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default UpdateService;
