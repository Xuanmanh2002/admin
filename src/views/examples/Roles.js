import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardFooter,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Media,
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
import { getAllRoles, checkRoleAdmin } from "components/utils/ApiFunctions";

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const navigate = useNavigate();

  useEffect(() => {
    const verifyAdminAndFetchRoles = async () => {
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
          const data = await getAllRoles();

          if (data.length === 0) {
            setError("No roles available.");
          } else {
            setRoles(data);
            setFilteredRoles(data);
          }
        } else {
          setError("You do not have permission to view roles.");
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

    verifyAdminAndFetchRoles();
  }, [navigate]);

  const handleFilterChange = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setFilter(searchTerm);
    const filtered = roles.filter((role) =>
      role.name.toLowerCase().includes(searchTerm) ||
      role.description.toLowerCase().includes(searchTerm)
    );
    setFilteredRoles(filtered);
    setCurrentPage(1);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRoles.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <Header />
      <Container className="mt--7" fluid>
        <Row>
          <div className="col">
            <Card className="shadow">
              <CardHeader className="border-0 d-flex justify-content-between align-items-center">
                <h3 className="mb-0">Roles Table</h3>
                {isAdmin && (
                  <div className="d-flex align-items-center">
                    <Input
                      type="text"
                      placeholder="Filter roles by name or description"
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
                  ) : currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center">No roles found.</td>
                    </tr>
                  ) : isAdmin ? (
                    currentItems.map((role, index) => (
                      <tr key={index}>
                        <td>{indexOfFirstItem + index + 1}</td>
                        <th scope="row">
                          <Media className="align-items-center">
                            <Media>
                              <span className="mb-0 text-sm">{role.name}</span>
                            </Media>
                          </Media>
                        </th>
                        <td>{role.description}</td>
                        <td>{role.createAt ? format(new Date(role.createAt), "dd/MM/yyyy") : "N/A"}</td>
                        <td>
                          <UncontrolledDropdown>
                            <DropdownToggle className="btn-icon-only text-light" size="sm">
                              <i className="fas fa-ellipsis-v" />
                            </DropdownToggle>
                            <DropdownMenu className="dropdown-menu-arrow" right>
                              <DropdownItem href="#pablo">Edit</DropdownItem>
                              <DropdownItem href="#pablo">Delete</DropdownItem>
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
                          href="#pablo"
                          tabIndex="-1"
                          onClick={() => handlePageChange(currentPage - 1)}
                        >
                          <i className="fas fa-angle-left" />
                        </PaginationLink>
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <PaginationItem
                          key={i + 1}
                          active={i + 1 === currentPage}
                        >
                          <PaginationLink href="#pablo" onClick={() => handlePageChange(i + 1)}>
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem disabled={currentPage === totalPages}>
                        <PaginationLink
                          href="#pablo"
                          onClick={() => handlePageChange(currentPage + 1)}
                        >
                          <i className="fas fa-angle-right" />
                        </PaginationLink>
                      </PaginationItem>
                    </Pagination>
                  </nav>
                </CardFooter>
              )}
            </Card>
          </div>
        </Row>
      </Container>
    </>
  );
};

export default Roles;
