import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { updateCategory, checkRoleAdmin } from "components/utils/ApiFunctions";
import { Button, Form, FormGroup, Input, Container, Row, Col, Card, CardBody, CardHeader, Label } from "reactstrap";
import { notification } from "antd";
import Header from "components/Headers/Header.js";

const UpdateCategory = () => {
    const { id } = useParams();
    const location = useLocation();
    const category = location.state || {};

    const [updatedCategory, setUpdatedCategory] = useState({
        categoryName: category.categoryName || "",
        description: category.description || "",
        images: category.images || null,
    });

    const [previewImage, setPreviewImage] = useState(category.images || "");
    const [errorMessage, setErrorMessage] = useState("");
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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUpdatedCategory({ ...updatedCategory, images: file });
            const reader = new FileReader();
            reader.onload = () => setPreviewImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isAdmin) return; 
        const formData = new FormData();
        formData.append("categoryName", updatedCategory.categoryName);
        formData.append("description", updatedCategory.description);
        if (updatedCategory.images) {
            formData.append("images", updatedCategory.images); 
        }
        try {
            const success = await updateCategory(id, formData); 
            if (success) {
                notification.success({
                    message: "Category Updated",
                    description: "The category has been updated successfully.",
                });
                setErrorMessage("");
                navigate("/admin/category"); 
            } else {
                setErrorMessage("Failed to update category.");
            }
        } catch (error) {
            setErrorMessage(error.message);
            notification.error({
                message: "Error",
                description: error.message,
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
                                <h3 className="mb-0">Update Category</h3>
                            </CardHeader>
                            <CardBody>
                                <Form onSubmit={handleSubmit}>
                                    {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
                                    <FormGroup>
                                        <Label htmlFor="categoryName">Category Name</Label>
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
                                        <Label htmlFor="description">Description</Label>
                                        <Input
                                            type="text"
                                            id="description"
                                            name="description"
                                            value={updatedCategory.description}
                                            onChange={handleInputChange}
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
