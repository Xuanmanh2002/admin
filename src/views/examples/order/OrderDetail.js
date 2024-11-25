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
import { useParams } from "react-router-dom";
import Header from "components/Headers/Header.js";
import { getOrderDetails, getAllService } from "components/utils/ApiFunctions";
import { notification } from 'antd';
import { FaTrash } from "react-icons/fa";

const OrderDetail = () => {
    const { id } = useParams();
    const [services, setServices] = useState([]);
    const [orderDetail, setOrderDetail] = useState([]);
    const [filteredOrderDetail, setFilteredOrderDetail] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const orderDetailPerPage = 5;

    useEffect(() => {
        const fetchOrderDetails = async () => {
            setLoading(true);
            try {
                const details = await getOrderDetails(id);
                const serviceList = await getAllService(); // Renaming service to serviceList to avoid conflicts
                setOrderDetail(details);
                setServices(serviceList);
                setFilteredOrderDetail(details);
            } catch (err) {
                setError("Failed to fetch order details.");
                notification.error({
                    message: "Error",
                    description: "Failed to fetch order details.",
                    placement: "topRight",
                });
            } finally {
                setLoading(false);
            }
        };
        if (id) {
            fetchOrderDetails();
        }
    }, [id]);

    const handleFilterChange = (e) => {
        const searchTerm = e.target.value.toLowerCase();
        setFilter(searchTerm);

        const filtered = searchTerm
            ? orderDetail.filter(
                (order) =>
                    order.serviceId.toLowerCase().includes(searchTerm) ||
                    order.quantity.toString().includes(searchTerm) ||
                    order.price.toString().includes(searchTerm)
            )
            : orderDetail;

        setFilteredOrderDetail(filtered);
        setCurrentPage(1);
    };

    const indexOfLastOrderDetail = currentPage * orderDetailPerPage;
    const indexOfFirstOrderDetail = indexOfLastOrderDetail - orderDetailPerPage;
    const currentOrders = filteredOrderDetail.slice(indexOfFirstOrderDetail, indexOfLastOrderDetail);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Function to get service name by serviceId
    const getServiceNameById = (serviceId) => {
        const service = services.find(service => service.id === serviceId);
        return service ? service.serviceName : "Unknown";
    };

    return (
        <>
            <Header />
            <Container className="mt--7" fluid>
                <Row>
                    <div className="col">
                        <Card className="shadow">
                            <CardHeader className="border-0 d-flex justify-content-between align-items-center">
                                <h3 className="mb-0">Order Details Table</h3>
                                <div>
                                    <Input
                                        type="text"
                                        placeholder="Filter order details by service, quantity, or price"
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
                                        <th scope="col">Service</th>
                                        <th scope="col">Quantity</th>
                                        <th scope="col">Price</th>
                                        <th scope="col">Amounts</th>
                                        <th scope="col">Validity Period</th>
                                        <th scope="col">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="7" className="text-center">
                                                <div className="spinner-border" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : currentOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center">
                                                No orders found.
                                            </td>
                                        </tr>
                                    ) : (
                                        currentOrders
                                            .sort((a, b) => new Date(a.orderDate) - new Date(b.orderDate))
                                            .map((order, index) => (
                                                <tr key={order.id}>
                                                    <th scope="row">{index + 1}</th> 
                                                    <td>{getServiceNameById(order.serviceId)}</td> 
                                                    <td>{order.quantity}</td>
                                                    <td>{order.price}</td>
                                                    <td>
                                                        {order.totalAmounts
                                                            ? `${order.totalAmounts.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}`
                                                            : "N/A"}
                                                    </td>
                                                    <td>{order.totalValidityPeriod}</td>
                                                    <td>
                                                        <FaTrash
                                                            className="text-danger cursor-pointer"
                                                            size={20}
                                                            onClick={() => {
                                                                // Add deletion logic here
                                                            }}
                                                        />
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
                                    {[...Array(Math.ceil(filteredOrderDetail.length / orderDetailPerPage))].map((_, i) => (
                                        <PaginationItem key={i} active={i + 1 === currentPage}>
                                            <PaginationLink onClick={() => paginate(i + 1)}>{i + 1}</PaginationLink>
                                        </PaginationItem>
                                    ))}
                                    <PaginationItem
                                        disabled={currentPage === Math.ceil(filteredOrderDetail.length / orderDetailPerPage)}
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

export default OrderDetail;
