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
import Header from "components/Headers/Header.js";
import { createService, checkRoleAdmin } from "components/utils/ApiFunctions";
import 'react-quill/dist/quill.snow.css';

const CreateService = () => {
    const [newService, setNewService] = useState({
        serviceName: "",
        price: "",
        validityPeriod: "",
        description: "",
    });
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAdminRole = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                const result = await checkRoleAdmin(token);
                setIsAdmin(result);
                if (!result) {
                    setErrorMessage("Access restricted to admins only.");
                }
            } else {
                setErrorMessage("No token found. Please log in as an admin.");
            }
        };
        checkAdminRole();
    }, []);

    const handleServiceInputChange = (e) => {
        const { name, value } = e.target;
        setNewService({ ...newService, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isAdmin) {
            setErrorMessage("You do not have permission to create services.");
            return;
        }

        try {
            const response = await createService(
                newService.serviceName,
                newService.price,
                newService.validityPeriod,
                newService.description
            );

            if (response.success) {
                setSuccessMessage(response.message);
                setNewService({
                    serviceName: "",
                    price: "",
                    validityPeriod: "",
                    description: "",
                });
                setErrorMessage("");
            } else {
                setErrorMessage(response.message);
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
                                <h3 className="mb-0">Create New Service</h3>
                            </CardHeader>
                            <CardBody>
                                <Form role="form" onSubmit={handleSubmit}>
                                    {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
                                    {successMessage && <div className="alert alert-success">{successMessage}</div>}
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
                                    <Button type="submit" color="primary" disabled={!isAdmin}>
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
