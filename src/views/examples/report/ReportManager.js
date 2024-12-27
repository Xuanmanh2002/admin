import React, { useEffect, useState } from "react";
import {
    Card,
    CardHeader,
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
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
} from "reactstrap";
import { format } from "date-fns";
import Header from "components/Headers/Header.js";
import { notification } from "antd";
import { getAllReports, getAllJob } from "components/utils/ApiFunctions";

const ReportManager = () => {
    const [reports, setReports] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState("");
    const [modal, setModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const reportsPerPage = 5;

    const openNotification = (type, message, description) => {
        notification[type]({
            message,
            description,
            placement: "topRight",
        });
    };

    useEffect(() => {
        const fetchReports = async () => {
            setLoading(true);
            setError(null);
            try {
                const reportData = await getAllReports();
                const jobData = await getAllJob(); 
                setReports(reportData);
                setJobs(jobData); 
                setLoading(false);
            } catch (err) {
                setError(err.message || "Failed to fetch data");
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    const handleFilterChange = (e) => {
        setFilter(e.target.value);
        setCurrentPage(1);
    };

    const filteredReports = reports.filter(
        (report) =>
            report.fullName.toLowerCase().includes(filter.toLowerCase()) ||
            report.email.toLowerCase().includes(filter.toLowerCase())
    );

    const indexOfLastReport = currentPage * reportsPerPage;
    const indexOfFirstReport = indexOfLastReport - reportsPerPage;
    const currentReports = filteredReports.slice(indexOfFirstReport, indexOfLastReport);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const openModal = (reportId) => {
        setSelectedReport(reportId);
        setModal(true);
    };

    const handleConfirmDelete = () => {
        openNotification("success", "Report Deleted", `Report ID ${selectedReport} has been deleted.`);
        setModal(false);
        setSelectedReport(null);
    };

    const getJobNameById = (jobId) => {
        const job = jobs.find((job) => job.id === jobId);
        return job ? job.jobName : "N/A";
    };


    return (
        <>
            <Header />
            <Container className="mt--7" fluid>
                <Row>
                    <div className="col">
                        <Card className="shadow">
                            <CardHeader className="border-0 d-flex justify-content-between align-items-center">
                                <h3 className="mb-0">Reports Table</h3>
                                <div className="d-flex align-items-center">
                                    <Input
                                        type="text"
                                        placeholder="Filter Reports by name or email"
                                        value={filter}
                                        onChange={handleFilterChange}
                                        className="me-2"
                                    />
                                </div>
                            </CardHeader>

                            <Table className="align-items-center table-flush" responsive>
                                <thead className="thead-light">
                                    <tr>
                                        <th scope="col">ID</th>
                                        <th scope="col">Full Name</th>
                                        <th scope="col">Email</th>
                                        <th scope="col">Telephone</th>
                                        <th scope="col">Create At</th>
                                        <th scope="col">Content</th>
                                        <th scope="col">Address</th>
                                        <th scope="col">Status</th>
                                        <th scope="col">Recruitment Post</th>
                                        <th scope="col">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="10" className="text-center">
                                                Loading...
                                            </td>
                                        </tr>
                                    ) : error ? (
                                        <tr>
                                            <td colSpan="10" className="text-danger text-center">
                                                {error}
                                            </td>
                                        </tr>
                                    ) : currentReports.length === 0 ? (
                                        <tr>
                                            <td colSpan="10" className="text-center">
                                                No reports found.
                                            </td>
                                        </tr>
                                    ) : (
                                        currentReports.map((report) => (
                                            <tr key={report.id}>
                                                <th scope="row">{report.id}</th>
                                                <td>{report.fullName}</td>
                                                <td>{report.email}</td>
                                                <td>{report.telephone}</td>
                                                <td>{format(new Date(report.createAt), "dd/MM/yyyy")}</td>
                                                <td>{report.letter || "N/A"}</td>
                                                <td>{report.address}</td>
                                                <td>
                                                    <span
                                                        className={
                                                            report.status ? "text-success" : "text-danger"
                                                        }
                                                    >
                                                        {report.status ? "Seen" : "UnSeen"}
                                                    </span>
                                                </td>
                                                <td>{getJobNameById(report.jobId)}</td>
                                                <td>
                                                    <UncontrolledDropdown>
                                                        <DropdownToggle
                                                            className="btn-icon-only text-light"
                                                            size="sm"
                                                        >
                                                            <i className="fas fa-ellipsis-v" />
                                                        </DropdownToggle>
                                                        <DropdownMenu className="dropdown-menu-arrow" right>
                                                            <DropdownItem onClick={() => openModal(report.id)}>
                                                                Delete
                                                            </DropdownItem>
                                                        </DropdownMenu>
                                                    </UncontrolledDropdown>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </Table>

                            <Pagination className="pagination justify-content-end mb-0">
                                <PaginationItem disabled={currentPage === 1}>
                                    <PaginationLink previous onClick={() => paginate(currentPage - 1)} />
                                </PaginationItem>
                                {[...Array(Math.ceil(filteredReports.length / reportsPerPage))].map((_, i) => (
                                    <PaginationItem key={i} active={i + 1 === currentPage}>
                                        <PaginationLink onClick={() => paginate(i + 1)}>
                                            {i + 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}
                                <PaginationItem
                                    disabled={currentPage === Math.ceil(filteredReports.length / reportsPerPage)}
                                >
                                    <PaginationLink next onClick={() => paginate(currentPage + 1)} />
                                </PaginationItem>
                            </Pagination>
                        </Card>
                    </div>
                </Row>
            </Container>

            <Modal isOpen={modal} toggle={() => setModal(false)}>
                <ModalHeader toggle={() => setModal(false)}>Confirm Deletion</ModalHeader>
                <ModalBody>
                    Are you sure you want to delete this report?
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={() => setModal(false)}>
                        Cancel
                    </Button>
                    <Button color="danger" onClick={handleConfirmDelete}>
                        Confirm Delete
                    </Button>
                </ModalFooter>
            </Modal>
        </>
    );
};

export default ReportManager;
