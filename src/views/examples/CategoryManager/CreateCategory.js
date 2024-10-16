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
import { createCategory, checkRoleAdmin } from "components/utils/ApiFunctions"; 

const CreateCategory = () => {
    const [newCategory, setNewCategory] = useState({
        categoryName: "",
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

    const handleCategoryInputChange = (e) => {
        const { name, value } = e.target;
        console.log("Updating field:", name, "with value:", value);  
        setNewCategory({ ...newCategory, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isAdmin) {
            setErrorMessage("You do not have permission to create categories.");
            return;
        }
    
        console.log("Submitting category:", newCategory); 
    
        try {
            const response = await createCategory(newCategory.categoryName, newCategory.description);
            
            if (response.success) {
                setSuccessMessage(response.message); 
                setNewCategory({ categoryName: "", description: "" }); 
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
                                <h3 className="mb-0">Create New Category</h3>
                            </CardHeader>
                            <CardBody>
                                <Form role="form" onSubmit={handleSubmit}>
                                    {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
                                    {successMessage && <div className="alert alert-success">{successMessage}</div>}
                                    <FormGroup>
                                        <label htmlFor="categoryName">Category Name</label>
                                        <Input
                                            type="text"
                                            id="categoryName"
                                            name="categoryName"
                                            placeholder="Enter category name"
                                            value={newCategory.categoryName}
                                            onChange={handleCategoryInputChange}
                                            required
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <label htmlFor="description">Description</label>
                                        <Input
                                            type="text"
                                            id="description"
                                            name="description"
                                            placeholder="Enter description"
                                            value={newCategory.description}
                                            onChange={handleCategoryInputChange}
                                            required
                                        />
                                    </FormGroup>
                                    <Button type="submit" color="primary" disabled={!isAdmin}>
                                        Create Category
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

export default CreateCategory;
