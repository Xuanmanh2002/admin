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
import { getAllCustomer, checkRoleAdmin, deleteCustomer, getAllAddress } from "components/utils/ApiFunctions";
import { format } from "date-fns";

const Customer = () => {
  const [customers, setCustomers] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const customersPerPage = 5;
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const verifyAdminAndFetchCustomers = async () => {
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

        const data = await getAllCustomer();
        if (data.length === 0) {
          setError("No customers available.");
        } else {
          const customersWithAddress = data.map((customer) => {
            const address = allAddresses.find(addr => addr.id === customer.addressId);
            return { ...customer, addressName: address ? address.name : "Unknown" };
          });
          setCustomers(customersWithAddress);
          setFilteredCustomers(customersWithAddress);
        }
      } catch (error) {
        setError(error.message || "An error occurred while fetching customers.");
      } finally {
        setLoading(false);
      }
    };

    verifyAdminAndFetchCustomers();
  }, [navigate]);

  const handleFilterChange = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setFilter(searchTerm);

    if (searchTerm === "") {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter((customer) =>
        customer.email?.toLowerCase().includes(searchTerm) ||
        customer.firstName?.toLowerCase().includes(searchTerm) ||
        customer.lastName?.toLowerCase().includes(searchTerm)
      );
      setFilteredCustomers(filtered);
    }
  };

  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleDelete = async (email) => {
    try {
      const result = await deleteCustomer(email);
      if (!result) {
        setSuccessMessage(`Customer with email ${email} was deleted successfully.`);
        const updatedCustomers = await getAllCustomer();
        setCustomers(updatedCustomers);
        setFilteredCustomers(updatedCustomers);
      } else {
        setErrorMessage(`Error deleting customer: ${result.message}`);
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
                <h3 className="mb-0">Customers Table</h3>
                {isAdmin && (
                  <div className="d-flex align-items-center">
                    <Input
                      type="text"
                      placeholder="Filter Customers by name or email"
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
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="10" className="text-center">Loading...</td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="10" className="text-danger text-center">{error}</td>
                    </tr>
                  ) : currentCustomers.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="text-center">No customers found.</td>
                    </tr>
                  ) : (
                    currentCustomers.map((customer, index) => (
                      <tr key={index}>
                        <th scope="row">{indexOfFirstCustomer + index + 1}</th>
                        <td>{customer.firstName}</td>
                        <td>{customer.lastName}</td>
                        <td>{customer.email}</td>
                        <td>
                          <img
                            src={`data:image/jpeg;base64,${customer.avatar}`}
                            alt="avatar"
                            style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                          />
                        </td>
                        <td>{customer.gender}</td>
                        <td>{customer.telephone}</td>
                        <td>{customer.birthDate ? format(new Date(customer.birthDate), 'dd/MM/yyyy') : 'N/A'}</td>
                        <td>{customer.addressName}</td>
                        <td>
                          <UncontrolledDropdown>
                            <DropdownToggle className="btn-icon-only text-light" size="sm">
                              <i className="fas fa-ellipsis-v" />
                            </DropdownToggle>
                            <DropdownMenu className="dropdown-menu-arrow" right>
                              <DropdownItem>Edit</DropdownItem>
                              <DropdownItem onClick={() => handleDelete(customer.email)}>Delete</DropdownItem>
                            </DropdownMenu>
                          </UncontrolledDropdown>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>

              {isAdmin && (
                <CardFooter className="py-4">
                  <nav aria-label="...">
                    <Pagination className="pagination justify-content-end mb-0">
                      <PaginationItem disabled={currentPage === 1}>
                        <PaginationLink onClick={() => paginate(currentPage - 1)} previous />
                      </PaginationItem>
                      {Array.from({ length: Math.ceil(filteredCustomers.length / customersPerPage) }, (_, i) => (
                        <PaginationItem key={i} active={i + 1 === currentPage}>
                          <PaginationLink onClick={() => paginate(i + 1)}>
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem disabled={currentPage === Math.ceil(filteredCustomers.length / customersPerPage)}>
                        <PaginationLink onClick={() => paginate(currentPage + 1)} next />
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

export default Customer;
