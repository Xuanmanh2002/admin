import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardFooter,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Pagination,
  PaginationItem,
  PaginationLink,
  Table,
  Container,
  Row,
  Input,
} from "reactstrap";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import Header from "components/Headers/Header.js";
import { getAllCategories, checkRoleAdmin, deleteCategory } from "components/utils/ApiFunctions";
import { Modal, notification } from "antd";

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const categoriesPerPage = 5;
  const [errorMessage, setErrorMessage] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAdminAndFetchCategories = async () => {
      setLoading(true);

      try {
        const token = localStorage.getItem("token");
        const adminId = localStorage.getItem("adminId");

        if (!token || !adminId) {
          navigate("/auth/login", {
            state: { message: "Token or Admin ID expired. Please log in again." },
          });
          return;
        }

        const isAdminRole = await checkRoleAdmin(token);

        if (isAdminRole) {
          setIsAdmin(true);
          const data = await getAllCategories();

          if (data.length === 0) {
            setError("No Categories available.");
          } else {
            setCategories(data);
            setFilteredCategories(data);
          }
        } else {
          setError("You do not have permission to view Categories.");
          navigate("/auth/login", {
            state: { message: "Access restricted to admins only!" },
          });
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    verifyAdminAndFetchCategories();
  }, [navigate]);

  const handleFilterChange = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setFilter(searchTerm);

    if (searchTerm === "") {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter((category) =>
        category.categoryName?.toLowerCase().includes(searchTerm) ||
        category.description?.toLowerCase().includes(searchTerm)
      );
      setFilteredCategories(filtered);
    }
  };

  const showDeleteConfirm = (category) => {
    Modal.confirm({
      title: `Are you sure you want to delete category "${category.categoryName}"?`,
      onOk: () => handleDelete(category.id),
      onCancel: () => setCategoryToDelete(null),
    });
  };

  const handleDelete = async (categoryId) => {
    try {
      const result = await deleteCategory(categoryId);
      if (result === "") {
        notification.success({
          message: 'Category Deleted',
          description: `Category No ${categoryId} was deleted successfully.`,
          placement: 'topRight',
        });

        const updatedCategories = await getAllCategories();
        setCategories(updatedCategories);
        setFilteredCategories(updatedCategories);
      } else {
        console.error(`Error deleting category: ${result.message}`);
        setErrorMessage(`Error deleting category: ${result.message}`);
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
    setTimeout(() => {
      setErrorMessage("");
    }, 3000);
  };

  const indexOfLastCategory = currentPage * categoriesPerPage;
  const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
  const currentCategories = filteredCategories.slice(indexOfFirstCategory, indexOfLastCategory);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <Header />
      <Container className="mt--7" fluid>
        <Row>
          <div className="col">
            <Card className="shadow">
              <CardHeader className="border-0 d-flex justify-content-between align-items-center">
                <h3 className="mb-0">Categories Table</h3>
                {isAdmin && (
                  <div className="d-flex align-items-center">
                    <Input
                      type="text"
                      placeholder="Filter Categories by name or description"
                      value={filter}
                      onChange={handleFilterChange}
                      className="me-2"
                    />
                    <div style={{ paddingLeft: "10px" }}>
                      <button
                        className="btn btn-primary ms-2"
                        onClick={() => navigate('/admin/create-category')}
                        style={{ height: "40px" }}
                      >
                        Create
                      </button>
                    </div>
                  </div>
                )}
              </CardHeader>

              <Table className="align-items-center table-flush" responsive>
                <thead className="thead-light">
                  <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Name</th>
                    <th scopte="col">Images</th>
                    <th scope="col">Description</th>
                    <th scope="col">Created Date</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="text-center">Loading...</td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="5" className="text-danger text-center">{error}</td>
                    </tr>
                  ) : currentCategories.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center">No categories found.</td>
                    </tr>
                  ) : isAdmin ? (
                    currentCategories.map((category, index) => (
                      <tr key={index}>
                        <th scope="row">
                          {indexOfFirstCategory + index + 1}
                        </th>
                        <td>{category.categoryName}</td>
                        <td>
                          <img
                            src={`data:image/jpeg;base64,${category.images}`}
                            alt="avatar"
                            style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                          />
                        </td>
                        <td>{category.description}</td>
                        <td>{category.createAt ? format(new Date(category.createAt), "dd/MM/yyyy") : "N/A"}</td>
                        <td>
                          <UncontrolledDropdown>
                            <DropdownToggle className="btn-icon-only text-light" size="sm">
                              <i className="fas fa-ellipsis-v" />
                            </DropdownToggle>
                            <DropdownMenu className="dropdown-menu-arrow" right>
                              <DropdownItem onClick={() => showDeleteConfirm(category)}>Delete</DropdownItem>
                              <DropdownItem onClick={() => navigate(`/admin/update-category/${category.id}`, { state: category })}>
                                Edit
                              </DropdownItem>
                            </DropdownMenu>
                          </UncontrolledDropdown>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center">You do not have permission to view this content.</td>
                    </tr>
                  )}
                </tbody>
              </Table>
              {isAdmin && (
                <CardFooter className="py-4">
                  <nav aria-label="...">
                    <Pagination className="pagination justify-content-end mb-0">
                      <PaginationItem disabled={currentPage === 1}>
                        <PaginationLink
                          onClick={() => paginate(currentPage - 1)}
                          previous
                        />
                      </PaginationItem>
                      {[...Array(Math.ceil(filteredCategories.length / categoriesPerPage))].map((_, i) => (
                        <PaginationItem key={i} active={i + 1 === currentPage}>
                          <PaginationLink onClick={() => paginate(i + 1)}>
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem disabled={currentPage === Math.ceil(filteredCategories.length / categoriesPerPage)}>
                        <PaginationLink
                          onClick={() => paginate(currentPage + 1)}
                          next
                        />
                      </PaginationItem>
                    </Pagination>
                  </nav>
                </CardFooter>
              )}
            </Card>
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
          </div>
        </Row>
      </Container>
    </>
  );
};

export default Category;
