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
import { getAllJob, deleteJob, getAllCategories, updateJobStatus } from "components/utils/ApiFunctions";
import { notification } from "antd";

const JobManager = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [jobsPerPage, setJobsPerPage] = useState(5);
  const [modal, setModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);


  // Hàm mở thông báo
  const openNotification = (type, message, description) => {
    notification[type]({
      message,
      description,
      placement: "topRight",
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const jobsData = await getAllJob();
        const categoriesData = await getAllCategories();
        setCategories(categoriesData);
        const jobsWithCategoryName = jobsData.map((job) => {
          const category = categoriesData.find(
            (cat) => cat.id === job.categoryId
          );
          return {
            ...job,
            categoryName: category ? category.categoryName : "Unknown",
          };
        });

        setJobs(jobsWithCategoryName);
        setFilteredJobs(jobsWithCategoryName);
      } catch (err) {
        setError("Failed to load jobs.");
        openNotification("error", "Error", "Failed to load jobs.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUpdateJobStatus = async (jobId, status) => {
    try {
      const updatedJob = await updateJobStatus(jobId, status);
      setJobs(jobs.map((job) => (job.id === jobId ? updatedJob : job)));
      setFilteredJobs(
        filteredJobs.map((job) => (job.id === jobId ? updatedJob : job))
      );
      openNotification(
        "success",
        "Job Status Updated",
        `The job status has been ${status ? "activated" : "deactivated"}.`
      );
    } catch (error) {
      setError("Failed to update job status.");
      openNotification("error", "Error", "Failed to update job status.");
    }
  };

  const handleConfirmDelete = async () => {
    if (jobToDelete) {
      try {
        await deleteJob(jobToDelete);
        setJobs(jobs.filter((job) => job.id !== jobToDelete));
        setFilteredJobs(
          filteredJobs.filter((job) => job.id !== jobToDelete)
        );
        openNotification("success", "Job Deleted", "The job has been deleted successfully.");
      } catch (error) {
        setError("Failed to delete job.");
        openNotification("error", "Error", "Failed to delete job.");
      } finally {
        setModal(false);
        setJobToDelete(null);
      }
    }
  };

  const handleFilterChange = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setFilter(searchTerm);

    const filtered = searchTerm
      ? jobs.filter(
          (job) =>
            job.jobName?.toLowerCase().includes(searchTerm) ||
            job.recruitmentDetails?.toLowerCase().includes(searchTerm)
        )
      : jobs;

    setFilteredJobs(filtered);
  };

  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const openModal = (jobId) => {
    setJobToDelete(jobId);
    setModal(true);
  };

  return (
    <>
      <Header />
      <Container className="mt--7" fluid>
        <Row>
          <div className="col">
            <Card className="shadow">
              <CardHeader className="border-0 d-flex justify-content-between align-items-center">
                <h3 className="mb-0">Jobs Table</h3>
                <div className="d-flex align-items-center">
                  <Input
                    type="text"
                    placeholder="Filter Jobs by name or details"
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
                    <th scope="col">Job Name</th>
                    <th scope="col">Experience</th>
                    <th scope="col">Application deadline</th>
                    <th scope="col">Job details</th>
                    <th scope="col">Job Category</th>
                    <th scope="col">Date of creation</th>
                    <th scope="col">Expiration Date</th>
                    <th scope="col">Active</th>
                    <th scope="col">Employer</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="text-center">Loading...</td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="7" className="text-danger text-center">{error}</td>
                    </tr>
                  ) : currentJobs.length === 0 ? (
                    <tr>
                      <td colSpan="15" className="text-center">No jobs found.</td>
                    </tr>
                  ) : (
                    currentJobs.map((job, index) => (
                      <tr key={job.id}>
                        <th scope="row">{indexOfFirstJob + index + 1}</th>
                        <td>{job.jobName}</td>
                        <td>{job.experience}<span> năm</span></td>
                        <td>{job.applicationDeadline ? format(new Date(job.applicationDeadline), "dd/MM/yyyy") : "N/A"}</td>
                        <td>{job.recruitmentDetails}</td>
                        <td>{job.categoryName || "N/A"}</td>
                        <td>{job.createAt ? format(new Date(job.createAt), "dd/MM/yyyy") : "N/A"}</td>
                        <td>
                          {job.activationDate && job.totalValidityPeriod
                            ? format(
                              new Date(job.activationDate).setDate(
                                new Date(job.activationDate).getDate() + job.totalValidityPeriod
                              ),
                              "dd/MM/yyyy"
                            )
                            : "N/A"}
                        </td>
                        <td>
                          <span className={job.status ? "text-success" : "text-danger"}>
                            {job.status ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>{job.employerResponse?.companyName || "N/A"}</td>
                        <td>
                          <UncontrolledDropdown>
                            <DropdownToggle className="btn-icon-only text-light" size="sm">
                              <i className="fas fa-ellipsis-v" />
                            </DropdownToggle>
                            <DropdownMenu className="dropdown-menu-arrow" right>
                              <DropdownItem onClick={() => openModal(job.id)}>Delete</DropdownItem>
                              <DropdownItem onClick={() => handleUpdateJobStatus(job.id, job.status ? false : true)}>
                                {job.status ? "Deactivate" : "Activate"}
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
                  <PaginationLink
                    previous
                    onClick={() => paginate(currentPage - 1)}
                  />
                </PaginationItem>
                {[...Array(Math.ceil(filteredJobs.length / jobsPerPage))].map(
                  (_, i) => (
                    <PaginationItem
                      key={i}
                      active={i + 1 === currentPage}
                    >
                      <PaginationLink onClick={() => paginate(i + 1)}>
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}
                <PaginationItem
                  disabled={
                    currentPage === Math.ceil(filteredJobs.length / jobsPerPage)
                  }
                >
                  <PaginationLink
                    next
                    onClick={() => paginate(currentPage + 1)}
                  />
                </PaginationItem>
              </Pagination>
            </Card>
          </div>
        </Row>
      </Container>

      <Modal isOpen={modal} toggle={() => setModal(false)}>
        <ModalHeader toggle={() => setModal(false)}>Confirm Deletion</ModalHeader>
        <ModalBody>
          Are you sure you want to delete this job?
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

export default JobManager;
