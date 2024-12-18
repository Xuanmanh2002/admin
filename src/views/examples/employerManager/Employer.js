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
import { getAllEmployers, checkRoleAdmin, deleteEmployers, getAllAddress } from "components/utils/ApiFunctions";
import { format } from "date-fns";

const Employer = () => {
  const [employers, setEmployers] = useState([]);
  const [addresses, setAddresses] = useState([]);
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
            state: { message: "Session expired. Please log in again." },
          });
          return;
        }

        const isAdminRole = await checkRoleAdmin(token);
        if (!isAdminRole) {
          navigate("/auth/login", {
            state: { message: "Access restricted to admins only!" },
          });
          return;
        }

        setIsAdmin(true);

        const allAddresses = await getAllAddress();
        setAddresses(allAddresses);

        const data = await getAllEmployers();
        if (data.length === 0) {
          setError("No employers available.");
        } else {
          const employersWithAddress = data.map((employer) => {
            const address = allAddresses.find(addr => addr.id === employer.addressId);
            return { ...employer, addressName: address ? address.name : "Unknown" };
          });
          setEmployers(employersWithAddress);
          setFilteredEmployers(employersWithAddress);
        }
      } catch (error) {
        setError(error.message || "An error occurred while fetching employers.");
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

  const handleDelete = async (email) => {
    try {
      const result = await deleteEmployers(email);
      if (result === "") {
        setSuccessMessage(`Employers No ${email} was deleted.`);
        const updatedEmail = await getAllEmployers();
        setEmployers(updatedEmail);
        setFilteredEmployers(updatedEmail);
      } else {
        setErrorMessage(`Error deleting employers: ${result.message}`);
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
    setTimeout(() => {
      setSuccessMessage("");
      setErrorMessage("");
    }, 3000);
  };

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
                    <th scope="col">Avatar</th>
                    <th scope="col">Gender</th>
                    <th scope="col">Telephone</th>
                    <th scope="col">Birth Date</th>
                    <th scope="col">Address</th>
                    <th scope="col">Company Name</th>
                    <th scope="col">Ranker</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="11" className="text-center">Loading...</td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="11" className="text-danger text-center">{error}</td>
                    </tr>
                  ) : currentEmployers.length === 0 ? (
                    <tr>
                      <td colSpan="11" className="text-center">No employers found.</td>
                    </tr>
                  ) : isAdmin ? (
                    currentEmployers.map((employer, index) => (
                      <tr key={index}>
                        <th scope="row">{indexOfFirstEmployers + index + 1}</th>
                        <td>{employer.firstName}</td>
                        <td>{employer.lastName}</td>
                        <td>{employer.email}</td>
                        <td>
                          <img
                            src={`data:image/jpeg;base64,${employer.avatar}`}
                            alt="avatar"
                            style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                          />
                        </td>
                        <td>{employer.gender}</td>
                        <td>{employer.telephone}</td>
                        <td>{employer.birthDate ? format(new Date(employer.birthDate), 'dd/MM/yyyy') : 'N/A'}</td>
                        <td>{employer.addressName}</td>
                        <td>{employer.companyName}</td>
                        <td>{employer.rank}</td>
                        <td>
                          <UncontrolledDropdown>
                            <DropdownToggle className="btn-icon-only text-light" size="sm">
                              <i className="fas fa-ellipsis-v" />
                            </DropdownToggle>
                            <DropdownMenu className="dropdown-menu-arrow" right>
                              <DropdownItem>Edit</DropdownItem>
                              <DropdownItem onClick={() => handleDelete(employer.email)}>Delete</DropdownItem>
                            </DropdownMenu>
                          </UncontrolledDropdown>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="11" className="text-center">You do not have permission to view this content.</td>
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
                      {[...Array(Math.ceil(filteredEmployers.length / employersPerPage))].map((_, i) => (
                        <PaginationItem key={i} active={i + 1 === currentPage}>
                          <PaginationLink onClick={() => paginate(i + 1)}>
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem disabled={currentPage === Math.ceil(filteredEmployers.length / employersPerPage)}>
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
            {successMessage && <div className="alert alert-success">{successMessage}</div>}
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
          </div>
        </Row>
      </Container>
    </>
  );
};

export default Employer;
