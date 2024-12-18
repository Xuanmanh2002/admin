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
import { getAllService, checkRoleAdmin, deleteService } from "components/utils/ApiFunctions";

const Service = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const servicesPerPage = 5;
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const verifyAdminAndFetchServices = async () => {
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
          const data = await getAllService();

          if (data.length === 0) {
            setError("No services available.");
          } else {
            setServices(data);
            setFilteredServices(data);
          }
        } else {
          setError("You do not have permission to view services.");
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

    verifyAdminAndFetchServices();
  }, [navigate]);

  const handleFilterChange = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setFilter(searchTerm);

    if (searchTerm === "") {
      setFilteredServices(services);
    } else {
      const filtered = services.filter((service) =>
        service.serviceName?.toLowerCase().includes(searchTerm) ||
        service.description?.toLowerCase().includes(searchTerm)
      );
      setFilteredServices(filtered);
    }
  };

  const handleDelete = async (serviceId) => {
    try {
      const result = await deleteService(serviceId);
      if (result === "") {
        setSuccessMessage(`Service No ${serviceId} was deleted.`);
        const updatedServices = await getAllService();
        setServices(updatedServices);
        setFilteredServices(updatedServices);
      } else {
        setErrorMessage(`Error deleting service: ${result.message}`);
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
    setTimeout(() => {
      setSuccessMessage("");
      setErrorMessage("");
    }, 3000);
  };

  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;
  const currentServices = filteredServices.slice(indexOfFirstService, indexOfLastService);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <Header />
      <Container className="mt--7" fluid>
        <Row>
          <div className="col">
            <Card className="shadow">
              <CardHeader className="border-0 d-flex justify-content-between align-items-center">
                <h3 className="mb-0">Services Table</h3>
                {isAdmin && (
                  <div className="d-flex align-items-center">
                    <Input
                      type="text"
                      placeholder="Filter services by name or description"
                      value={filter}
                      onChange={handleFilterChange}
                      className="me-2"
                    />
                    <div style={{ paddingLeft: "10px" }}>
                      <button
                        className="btn btn-primary ms-2"
                        onClick={() => navigate("/admin/create-service")}
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
                    <th scope="col">Service Name</th>
                    <th scope="col">Price</th>
                    <th scope="col">Validity Period</th>
                    <th scope="col">Description</th>
                    <th scope="col">Created Date</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="text-center">Loading...</td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="8" className="text-danger text-center">{error}</td>
                    </tr>
                  ) : currentServices.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center">No services found.</td>
                    </tr>
                  ) : isAdmin ? (
                    currentServices.map((service) => (
                      <tr key={service.id}>
                        <th scope="row">{service.id}</th>
                        <td>{service.serviceName}</td>
                        <td>{service.price}<span> VNĐ</span></td>
                        <td>{service.validityPeriod}<span> ngày</span></td>
                        <td>{service.description}</td>
                        <td>{service.createAt ? format(new Date(service.createAt), "dd/MM/yyyy") : "N/A"}</td>
                        <td>
                          <UncontrolledDropdown>
                            <DropdownToggle className="btn-icon-only text-light" size="sm">
                              <i className="fas fa-ellipsis-v" />
                            </DropdownToggle>
                            <DropdownMenu className="dropdown-menu-arrow" right>
                              <DropdownItem onClick={() => handleDelete(service.id)}>Delete</DropdownItem>
                              <DropdownItem onClick={() => navigate(`/admin/update-service/${service.id}`, { state: service })}>
                                Edit
                              </DropdownItem>
                            </DropdownMenu>
                          </UncontrolledDropdown>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center">You do not have permission to view this content.</td>
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
                          onClick={() => paginate(currentPage - 1)}
                        >
                          <i className="fas fa-angle-left" />
                        </PaginationLink>
                      </PaginationItem>
                      {Array.from({ length: Math.ceil(filteredServices.length / servicesPerPage) }, (_, i) => (
                        <PaginationItem key={i + 1} active={i + 1 === currentPage}>
                          <PaginationLink href="#pablo" onClick={() => paginate(i + 1)}>
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem disabled={currentPage === Math.ceil(filteredServices.length / servicesPerPage)}>
                        <PaginationLink
                          href="#pablo"
                          onClick={() => paginate(currentPage + 1)}
                        >
                          <i className="fas fa-angle-right" />
                        </PaginationLink>
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

export default Service;
