import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardHeader,
  Table,
  Container,
  Row,
  Col,
} from "reactstrap";
import Header from "components/Headers/Header.js";
import {
  getTotalAmountsByQuarter,
  getTotalAmountsByYear,
  getTopSpendingEmployer,
  getTotalAmountsByEmployer,
} from "../components/utils/ApiFunctions";

const Index = () => {
  const [totalAmountsByYear, setTotalAmountsByYear] = useState([]);
  const [topEmployer, setTopEmployer] = useState({ name: "", totalAmount: 0 });
  const [amountsByEmployer, setAmountsByEmployer] = useState([]);
  const [error, setError] = useState(null); 

  useEffect(() => {
    async function fetchData() {
      try {
        const yearData = await getTotalAmountsByYear();
        console.log("Yearly Revenue Data:", yearData);
        setTotalAmountsByYear(yearData);

        const topEmployerData = await getTopSpendingEmployer();
        console.log("Top Employer Data:", topEmployerData);
        setTopEmployer(topEmployerData);

        const employerData = await getTotalAmountsByEmployer();
        console.log("Amounts by Employer Data:", employerData);
        setAmountsByEmployer(employerData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch data. Please try again later.");
      }
    }

    fetchData();
  }, []);

  return (
    <>
      <Header />
      <Container className="mt--10" fluid>
        {error && (
          <div className="alert alert-danger text-center" role="alert">
            {error}
          </div>
        )}
        <Row className="mt-5">
          {/* <Col xl="8">
            <Card className="shadow">
              <CardHeader className="border-0">
                <Row className="align-items-center">
                  <div className="col">
                    <h3 className="mb-0">Service Revenue (Yearly)</h3>
                  </div>
                  <div className="col text-right">
                    <Button
                      color="primary"
                      onClick={() => alert("See all feature coming soon!")}
                      size="sm"
                    >
                      See all
                    </Button>
                  </div>
                </Row>
              </CardHeader>
              <Table className="align-items-center table-flush" responsive>
                <thead className="thead-light">
                  <tr>
                    <th scope="col">Year</th>
                    <th scope="col">Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {totalAmountsByYear.length > 0 ? (
                    totalAmountsByYear.map((yearData, index) => (
                      <tr key={index}>
                        <td>{yearData.year}</td>
                        <td>{yearData.totalAmount}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" className="text-center">
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card>
          </Col> */}

          {/* <Col xl="4">
            <Card className="shadow">
              <CardHeader className="border-0">
                <Row className="align-items-center">
                  <div className="col">
                    <h3 className="mb-0">Top Spending Employer</h3>
                  </div>
                </Row>
              </CardHeader>
              <Table className="align-items-center table-flush" responsive>
                <thead className="thead-light">
                  <tr>
                    <th scope="col">Employer</th>
                    <th scope="col">Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {topEmployer && topEmployer.name ? (
                    <tr>
                      <td>{topEmployer.name}</td>
                      <td>{topEmployer.totalAmount}</td>
                    </tr>
                  ) : (
                    <tr>
                      <td colSpan="2" className="text-center">
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card>
          </Col> */}
        </Row>

        {/* <Row className="mt-5">
          <Col xl="12">
            <Card className="shadow">
              <CardHeader className="border-0">
                <Row className="align-items-center">
                  <div className="col">
                    <h3 className="mb-0">Total Amounts by Employer</h3>
                  </div>
                </Row>
              </CardHeader>
              <Table className="align-items-center table-flush" responsive>
                <thead className="thead-light">
                  <tr>
                    <th scope="col">Employer</th>
                    <th scope="col">Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {amountsByEmployer.length > 0 ? (
                    amountsByEmployer.map((employer, index) => (
                      <tr key={index}>
                        <td>{employer.companyName}</td>
                        <td>{employer.totalAmounts}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="2" className="text-center">
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card>
          </Col>
        </Row> */}
      </Container>
    </>
  );
};

export default Index;
