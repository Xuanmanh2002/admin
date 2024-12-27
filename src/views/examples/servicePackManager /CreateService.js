import React, { useState, useEffect } from "react";
import {
    Card,
    CardHeader,
    CardBody,
    Container,
    Row,
    Col,
    Form,
    FormGroup,
    Input,
    Button,
} from "reactstrap";
import { notification } from "antd";
import Header from "components/Headers/Header.js";
import { createService, checkRoleAdmin } from "components/utils/ApiFunctions";
import "react-quill/dist/quill.snow.css";

const CreateService = () => {
    const [newService, setNewService] = useState({
        serviceName: "",
        price: "",
        validityPeriod: "",
        benefit: "",
        displayPosition: "",
        description: "",
    });
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAdminRole = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                notification.error({
                    message: "Authentication Error",
                    description: "No token found. Please log in as an admin.",
                });
                return;
            }

            const result = await checkRoleAdmin(token);
            setIsAdmin(result);
            if (!result) {
                notification.error({
                    message: "Access Denied",
                    description: "Access restricted to admins only.",
                });
            }
        };
        checkAdminRole();
    }, []);

    const handleServiceInputChange = (e) => {
        const { name, value } = e.target;
        setNewService((prevState) => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isAdmin) {
            notification.error({
                message: "Permission Denied",
                description: "You do not have permission to create services.",
            });
            return;
        }

        try {
            const response = await createService(
                newService.serviceName,
                newService.price,
                newService.validityPeriod,
                newService.benefit,
                newService.displayPosition,
                newService.description
            );

            if (response.success) {
                notification.success({
                    message: "Success",
                    description: response.message,
                });
                setNewService({
                    serviceName: "",
                    price: "",
                    validityPeriod: "",
                    benefit: "",
                    displayPosition: "",
                    description: "",
                });
            } else {
                notification.error({
                    message: "Error",
                    description: response.message,
                });
            }
        } catch (error) {
            notification.error({
                message: "Error",
                description: error.message || "An unexpected error occurred.",
            });
        }
    };

    const isFormComplete = Object.values(newService).every((value) => value.trim() !== "");

    return (
        <>
            <Header />
            <Container className="mt--7" fluid>
                <Row>
                    <Col>
                        <Card className="shadow">
                            <CardHeader className="border-0">
                                <h3 className="mb-0">Create New Service</h3>
                            </CardHeader>
                            <CardBody>
                                <Form role="form" onSubmit={handleSubmit}>
                                    <FormGroup>
                                        <label htmlFor="serviceName">Service Name</label>
                                        <Input
                                            type="text"
                                            id="serviceName"
                                            name="serviceName"
                                            placeholder="Enter service name"
                                            value={newService.serviceName}
                                            onChange={handleServiceInputChange}
                                            required
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <label htmlFor="price">Price</label>
                                        <Input
                                            type="number"
                                            id="price"
                                            name="price"
                                            placeholder="Enter price"
                                            value={newService.price}
                                            onChange={handleServiceInputChange}
                                            required
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <label htmlFor="validityPeriod">Validity Period</label>
                                        <Input
                                            type="text"
                                            id="validityPeriod"
                                            name="validityPeriod"
                                            placeholder="Enter validity period"
                                            value={newService.validityPeriod}
                                            onChange={handleServiceInputChange}
                                            required
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <label htmlFor="benefit">Benefit</label>
                                        <Input
                                            type="number"
                                            id="benefit"
                                            name="benefit"
                                            placeholder="Enter benefit"
                                            value={newService.benefit}
                                            onChange={handleServiceInputChange}
                                            required
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <label htmlFor="displayPosition">Display Position</label>
                                        <Input
                                            type="text"
                                            id="displayPosition"
                                            name="displayPosition"
                                            placeholder="Enter display position"
                                            value={newService.displayPosition}
                                            onChange={handleServiceInputChange}
                                            required
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <label htmlFor="description">Description</label>
                                        <Input
                                            type="textarea"
                                            id="description"
                                            name="description"
                                            placeholder="Enter description"
                                            value={newService.description}
                                            onChange={handleServiceInputChange}
                                            required
                                            rows="5"
                                        />
                                    </FormGroup>
                                    <Button
                                        type="submit"
                                        color="primary"
                                        disabled={!isAdmin || !isFormComplete}
                                    >
                                        Create Service
                                    </Button>
                                </Form>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default CreateService;
