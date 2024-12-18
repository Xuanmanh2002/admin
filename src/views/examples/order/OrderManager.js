import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardFooter,
  Table,
  Container,
  Row,
  Input,
  Pagination,
  PaginationItem,
  PaginationLink,
  Alert,
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import Header from "components/Headers/Header.js";
import { getAllOrder, deleteOrder, updateOrderStatus } from "components/utils/ApiFunctions";
import { notification } from 'antd';
import { FaTrash } from "react-icons/fa";

const Order = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const orderData = await getAllOrder();
        setOrders(orderData);
        setFilteredOrders(orderData);
      } catch (err) {
        setError("Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleFilterChange = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setFilter(searchTerm);

    const filtered = searchTerm
      ? orders.filter(
        (order) =>
          order.customerName?.toLowerCase().includes(searchTerm) ||
          order.status?.toLowerCase().includes(searchTerm)
      )
      : orders;

    setFilteredOrders(filtered);
  };

  const updateOrderStatusHandler = async (id, newStatus) => {
    try {
      const response = await updateOrderStatus(id, newStatus);
      if (response.success) {
        const updatedOrders = orders.map(order =>
          order.id === id ? { ...order, orderStatus: newStatus } : order
        );
        setOrders(updatedOrders);
        setFilteredOrders(updatedOrders);
        notification.success({
          message: 'Order Status Updated',
          description: 'The order status has been successfully updated.',
          placement: 'topRight',
        });
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Failed to update order status.");
      notification.error({
        message: 'Error',
        description: 'Failed to update order status.',
        placement: 'topRight',
      });
    }
  };

  const deleteOrderHandler = async (id) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        const response = await deleteOrder(id);
        if (response.success) {
          const updatedOrders = orders.filter((order) => order.id !== id);
          setOrders(updatedOrders);
          setFilteredOrders(updatedOrders);
          notification.success({
            message: 'Order Deleted',
            description: response.message,
            placement: 'topRight',
          });
        } else {
          setError(response.message);
        }
      } catch (err) {
        setError("Failed to delete the order.");
        notification.error({
          message: 'Error',
          description: 'Failed to delete the order.',
          placement: 'topRight',
        });
      }
    }
  };

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const getStatusButtonClass = (status) => {
    switch (status) {
      case 'Chưa giải quyết':
        return 'btn-warning';
      case 'Thanh toán thành công':
        return 'btn-success';
      default:
        return 'btn-secondary';
    }
  };

  return (
    <>
      <Header />
      <Container className="mt--7" fluid>
        <Row>
          <div className="col">
            <Card className="shadow">
              <CardHeader className="border-0 d-flex justify-content-between align-items-center">
                <h3 className="mb-0">Orders Table</h3>
                <div>
                  <Input
                    type="text"
                    placeholder="Filter orders by customer name or status"
                    value={filter}
                    onChange={handleFilterChange}
                  />
                </div>
              </CardHeader>

              {error && <Alert color="danger">{error}</Alert>}

              <Table className="align-items-center table-flush" responsive>
                <thead className="thead-light">
                  <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Employer</th>
                    <th scope="col">Company Name</th>
                    <th scope="col">Validity Period</th>
                    <th scope="col">Order Date</th>
                    <th scope="col">Order Status</th>
                    <th scope="col">Total Amounts</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="text-center">
                        <div className="spinner-border" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </td>
                    </tr>
                  ) : currentOrders.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center">
                        No orders found.
                      </td>
                    </tr>
                  ) : (
                    currentOrders
                      .sort((a, b) => new Date(a.orderDate) - new Date(b.orderDate))
                      .map((order, index) => (
                        <tr key={order.id}>
                          <th scope="row">{index + 1}</th>
                          <td>{order.employerResponse?.firstName} {order.employerResponse?.lastName}</td>
                          <td>{order.employerResponse?.companyName}</td>
                          <td>{order.totalValidityPeriod} ngày</td>
                          <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                          <td>
                            <button
                              className={`btn btn-sm ${getStatusButtonClass(order.orderStatus)}`}
                              onClick={() => updateOrderStatusHandler(order.id, order.orderStatus === "Chờ thanh toán" ? "Thanh toán thành công" : "Chờ thanh toán")}
                            >
                              {order.orderStatus}
                            </button>
                          </td>
                          <td>
                            {order.totalAmounts
                              ? `${order.totalAmounts.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}`
                              : "N/A"}
                          </td>
                          <td style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <FaTrash
                              onClick={() => deleteOrderHandler(order.id)}
                              className="text-danger cursor-pointer"
                              size={20}
                              title="Delete Order"
                              style={{ cursor: "pointer" }}
                            />
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => navigate(`/admin/view-order-details/${order.id}`)}
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </Table>
              <CardFooter className="py-4">
                <Pagination className="pagination justify-content-end mb-0">
                  <PaginationItem disabled={currentPage === 1}>
                    <PaginationLink onClick={() => paginate(currentPage - 1)} previous />
                  </PaginationItem>
                  {[...Array(Math.ceil(filteredOrders.length / ordersPerPage))].map((_, i) => (
                    <PaginationItem key={i} active={i + 1 === currentPage}>
                      <PaginationLink onClick={() => paginate(i + 1)}>{i + 1}</PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem
                    disabled={currentPage === Math.ceil(filteredOrders.length / ordersPerPage)}
                  >
                    <PaginationLink onClick={() => paginate(currentPage + 1)} next />
                  </PaginationItem>
                </Pagination>
              </CardFooter>
            </Card>
          </div>
        </Row>
      </Container>
    </>
  );
};

export default Order;
