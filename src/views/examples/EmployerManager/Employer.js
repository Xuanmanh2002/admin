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
import { useNavigate } from "react-router-dom";
import Header from "components/Headers/Header.js";
import { getAllEmployers, checkRoleAdmin, deleteCategory } from "components/utils/ApiFunctions";

const Employer = () => {
  const [employers, setEmployers] = useState([]);
  const [filteredEmployers, setFilteredEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const employersPerPage = 5;
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const verifyAdminAndFetchEmployers = async () => {
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
          const data = await getAllEmployers(); 

          if (data.length === 0) {
            setError("No employers available.");
          } else {
            setEmployers(data);
            setFilteredEmployers(data);
          }
        } else {
          setError("You do not have permission to view Employers.");
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

    verifyAdminAndFetchEmployers();
  }, [navigate]);

  const handleFilterChange = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setFilter(searchTerm);

    if (searchTerm === "") {
      setFilteredEmployers(employers);
    } else {
      const filtered = employers.filter((employer) =>
        employer.email?.toLowerCase().includes(searchTerm) ||
        employer.firstName?.toLowerCase().includes(searchTerm) ||
        employer.lastName?.toLowerCase().includes(searchTerm)
      );
      setFilteredEmployers(filtered);
    }
  };

  const indexOfLastEmployers = currentPage * employersPerPage;
  const indexOfFirstEmployers = indexOfLastEmployers - employersPerPage;
  const currentEmployers = filteredEmployers.slice(indexOfFirstEmployers, indexOfLastEmployers);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <Header />
      <Container className="mt--7" fluid>
        <Row>
          <div className="col">
            <Card className="shadow">
              <CardHeader className="border-0 d-flex justify-content-between align-items-center">
                <h3 className="mb-0">Employers Table</h3>
                {isAdmin && (
                  <div className="d-flex align-items-center">
                    <Input
                      type="text"
                      placeholder="Filter Employers by name or email"
                      value={filter}
                      onChange={handleFilterChange}
                      className="me-2"
                    />
                  </div>
                )}
              </CardHeader>

              <Table className="align-items-center table-flush" responsive>
                <thead className="thead-light">
                  <tr>
                    <th scope="col">ID</th>
                    <th scope="col">First Name</th>
                    <th scope="col">Last Name</th>
                    <th scope="col">Email</th>
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
                  ) : currentEmployers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center">No employers found.</td>
                    </tr>
                  ) : isAdmin ? (
                    currentEmployers.map((employer, index) => (
                      <tr key={index}>
                        <th scope="row">
                          {indexOfFirstEmployers + index + 1}
                        </th>
                        <td>{employer.firstName}</td>
                        <td>{employer.lastName}</td>
                        <td>{employer.email}</td>
                        <td>
                          <UncontrolledDropdown>
                            <DropdownToggle className="btn-icon-only text-light" size="sm">
                              <i className="fas fa-ellipsis-v" />
                            </DropdownToggle>
                            <DropdownMenu className="dropdown-menu-arrow" right>
                              <DropdownItem>Edit</DropdownItem>
                              <DropdownItem>Delete</DropdownItem>
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
                      {[...Array(Math.ceil(filteredEmployers.length / employersPerPage))].map((_, i) => (
                        <PaginationItem key={i} active={i + 1 === currentPage}>
                          <PaginationLink onClick={() => paginate(i + 1)}>
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                    </Pagination>
                  </nav>
                </CardFooter>
              )}
            </Card>
            {successMessage && <div className="alert alert-success">{successMessage}</div>}
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
          </div>
        </Row>
      </Container>
    </>
  );
};

export default Employer;
