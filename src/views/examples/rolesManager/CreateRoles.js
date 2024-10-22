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
import { createRoles, checkRoleAdmin } from "components/utils/ApiFunctions";
import { useNavigate } from "react-router-dom";
import 'react-quill/dist/quill.snow.css';

const CreateRoles = () => {
    const [newRoles, setNewRoles] = useState({
        name: "",
        description: "",
    });
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAdminRole = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const result = await checkRoleAdmin(token);
                    setIsAdmin(result);
                    if (!result) {
                        setErrorMessage("Access restricted to admins only.");
                        navigate("/auth/login", { state: { message: "Admin access required." } });
                    }
                } catch (error) {
                    setErrorMessage("Error verifying admin role.");
                } finally {
                    setLoading(false);
                }
            } else {
                setErrorMessage("No token found. Please log in as an admin.");
                navigate("/auth/login", { state: { message: "Please log in." } });
            }
        };
        checkAdminRole();
    }, [navigate]);

    const handleRolesInputChange = (e) => {
        const { name, value } = e.target;
        setNewRoles({ ...newRoles, [name]: value });
        setErrorMessage(""); // Clear error message on input change
        setSuccessMessage(""); // Clear success message on input change
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isAdmin) {
            setErrorMessage("You do not have permission to create roles.");
            return;
        }

        setLoading(true); // Start loading

        try {
            const response = await createRoles(newRoles.name, newRoles.description);
            
            if (response.success) {
                setSuccessMessage(response.message);
                setNewRoles({ name: "", description: "" }); // Reset form fields
                setErrorMessage("");
            } else {
                setErrorMessage(response.message);
            }
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            setLoading(false); // End loading
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
                                <h3 className="mb-0">Create New Role</h3>
                            </CardHeader>
                            <CardBody>
                                <Form role="form" onSubmit={handleSubmit}>
                                    {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
                                    {successMessage && <div className="alert alert-success">{successMessage}</div>}
                                    <FormGroup>
                                        <label htmlFor="name">Name</label>
                                        <Input
                                            type="text"
                                            id="name"
                                            name="name"
                                            placeholder="Enter role name"
                                            value={newRoles.name}
                                            onChange={handleRolesInputChange}
                                            required
                                            disabled={loading}
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <label htmlFor="description">Description</label>
                                        <Input
                                            type="textarea"
                                            id="description"
                                            name="description"
                                            placeholder="Enter description"
                                            value={newRoles.description}
                                            onChange={handleRolesInputChange}
                                            required
                                            rows="5"
                                            disabled={loading}
                                        />
                                    </FormGroup>
                                    <Button type="submit" color="primary" disabled={!isAdmin || loading}>
                                        {loading ? "Loading..." : "Create Role"}
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

export default CreateRoles;
