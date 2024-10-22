import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { updateCategory, checkRoleAdmin } from "components/utils/ApiFunctions";
import { Button, Form, FormGroup, Input, Container, Row, Col, Card, CardBody, CardHeader } from "reactstrap";
import Header from "components/Headers/Header.js";

const UpdateCategory = () => {
    const { id } = useParams();
    const location = useLocation();
    const category = location.state || {};
    
    const [updatedCategory, setUpdatedCategory] = useState({
        categoryName: category.categoryName || "",
        description: category.description || "",
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
        setUpdatedCategory({ ...updatedCategory, [name]: value });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isAdmin) return;
    
        try {
            const success = await updateCategory(id, updatedCategory.categoryName, updatedCategory.description);
            if (success) {
                setSuccessMessage("Category updated successfully!");
                setErrorMessage("");
                navigate("/admin/category");  
            } else {
                setErrorMessage("Failed to update category.");
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
                                <h3 className="mb-0">Update Category</h3>
                            </CardHeader>
                            <CardBody>
                                <Form onSubmit={handleSubmit}>
                                    {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
                                    {successMessage && <div className="alert alert-success">{successMessage}</div>}
                                    <FormGroup>
                                        <label htmlFor="categoryName">Category Name</label>
                                        <Input
                                            type="text"
                                            id="categoryName"
                                            name="categoryName"
                                            value={updatedCategory.categoryName}
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
                                            value={updatedCategory.description}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </FormGroup>
                                    <Button type="submit" color="primary">Update Category</Button>
                                </Form>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default UpdateCategory;
