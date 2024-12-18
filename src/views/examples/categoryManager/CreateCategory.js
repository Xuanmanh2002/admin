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
    Label,
} from "reactstrap";
import Header from "components/Headers/Header.js";
import { createCategory, checkRoleAdmin } from "components/utils/ApiFunctions";
import { notification } from 'antd';

const CreateCategory = () => {
    const [newCategory, setNewCategory] = useState({
        categoryName: "",
        description: "",
        images: null, 
    });
    const [errorMessage, setErrorMessage] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    const [previewImage, setPreviewImage] = useState("");

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
        setNewCategory({ ...newCategory, [name]: value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewCategory({ ...newCategory, images: file });
            const reader = new FileReader();
            reader.onload = () => setPreviewImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isAdmin) {
            setErrorMessage("You do not have permission to create categories.");
            return;
        }
    
        try {
            const response = await createCategory(
                newCategory.categoryName,
                newCategory.description,
                newCategory.images
            );
    
            if (response.success) {
                notification.success({
                    message: 'Category Created',
                    description: response.message,
                    placement: 'topRight',
                });
    
                setNewCategory({ categoryName: "", description: "", images: null });
                setPreviewImage("");
                setErrorMessage("");
            } else {
                setErrorMessage(response.message);
            }
        } catch (error) {
            setErrorMessage(error.message);
            notification.error({
                message: 'Error',
                description: error.message,
                placement: 'topRight',
            });
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
                                    <FormGroup>
                                        <Label htmlFor="categoryName">Category Name</Label>
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
                                        <Label htmlFor="description">Description</Label>
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
                                    <FormGroup>
                                        <Label htmlFor="images">Upload Image</Label>
                                        <div
                                            onClick={() => document.getElementById("images").click()}
                                            style={{
                                                cursor: "pointer",
                                                width: "150px",
                                                height: "150px",
                                                border: "2px dashed #ccc",
                                                borderRadius: "8px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                overflow: "hidden",
                                                backgroundColor: "#f9f9f9",
                                            }}
                                        >
                                            {previewImage ? (
                                                <img
                                                    src={previewImage}
                                                    alt="Preview"
                                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                />
                                            ) : (
                                                <span style={{ color: "#aaa", fontSize: "14px" }}>
                                                    Click to upload
                                                </span>
                                            )}
                                        </div>
                                        <Input
                                            type="file"
                                            id="images"
                                            name="images"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            style={{ display: "none" }} 
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
