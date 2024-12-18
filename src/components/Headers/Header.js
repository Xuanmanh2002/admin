import React, { useEffect, useState } from "react";
import { Card, CardBody, CardTitle, Container, Row, Col } from "reactstrap";
import { getTotalAmounts, getCountEmployers, getCountCustomers } from "components/utils/ApiFunctions"; // Nhớ import các hàm này

const Header = () => {
  const [revenue, setRevenue] = useState(null);
  const [employersCount, setEmployersCount] = useState(null);
  const [customersCount, setCustomersCount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const revenueData = await getTotalAmounts();
        setRevenue(revenueData);

        const employerData = await getCountEmployers();
        setEmployersCount(employerData);

        const customerData = await getCountCustomers();
        setCustomersCount(customerData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  return (
    <div className="header bg-gradient-info pb-8 pt-5 pt-md-8">
      <Container fluid>
        <div className="header-body">
          <Row>
            <Col lg="6" xl="3">
              <Card className="card-stats mb-4 mb-xl-0">
                <CardBody>
                  <Row>
                    <div className="col">
                      <CardTitle
                        tag="h5"
                        className="text-uppercase text-muted mb-0"
                      >
                        Revenue
                      </CardTitle>
                      <span className="h2 font-weight-bold mb-0">
                        {isLoading ? "Loading..." : revenue !== null ? formatCurrency(revenue) : "N/A"}
                      </span>
                    </div>
                    <Col className="col-auto">
                      <div className="icon icon-shape bg-danger text-white rounded-circle shadow">
                        <i className="fas fa-chart-bar" />
                      </div>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
            <Col lg="6" xl="3">
              <Card className="card-stats mb-4 mb-xl-0">
                <CardBody>
                  <Row>
                    <div className="col">
                      <CardTitle
                        tag="h5"
                        className="text-uppercase text-muted mb-0"
                      >
                        New employer
                      </CardTitle>
                      <span className="h2 font-weight-bold mb-0">
                        {isLoading ? "Loading..." : employersCount !== null ? employersCount : "N/A"} persons
                      </span>
                    </div>
                    <Col className="col-auto">
                      <div className="icon icon-shape bg-warning text-white rounded-circle shadow">
                        <i className="fas fa-chart-pie" />
                      </div>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
            <Col lg="6" xl="3">
              <Card className="card-stats mb-4 mb-xl-0">
                <CardBody>
                  <Row>
                    <div className="col">
                      <CardTitle
                        tag="h5"
                        className="text-uppercase text-muted mb-0"
                      >
                        New Customer
                      </CardTitle>
                      <span className="h2 font-weight-bold mb-0"> 
                        {isLoading ? "Loading..." : customersCount !== null ? customersCount : "N/A"} persons
                      </span>
                    </div>
                    <Col className="col-auto">
                      <div className="icon icon-shape bg-yellow text-white rounded-circle shadow">
                        <i className="fas fa-users" />
                      </div>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </Container>
    </div>
  );
};

export default Header;
