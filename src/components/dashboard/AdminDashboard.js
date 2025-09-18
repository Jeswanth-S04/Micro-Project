import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Alert, Tab, Tabs, Modal } from 'react-bootstrap';
import { Navigate, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { categoryService } from '../../services/categoryService';
import { allocationService } from '../../services/allocationService';
import { requestService } from '../../services/requestService';
import { dashboardService } from '../../services/dashboardService';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { toast } from 'react-toastify';
import CategoryModal from '../categories/CategoryModal';
import AllocationModal from '../allocations/AllocationModal';
import ReviewModal from '../requests/ReviewModal';
import LoadingSpinner from '../common/LoadingSpinner';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [categories, setCategories] = useState([]);
    const [allocations, setAllocations] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);

    // Modal states
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showAllocationModal, setShowAllocationModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);
    const [deletingCategory, setDeletingCategory] = useState(null);
    const [editingAllocation, setEditingAllocation] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
          setLoading(true);
      
          // Load categories
          console.log('Loading categories...');
          const categoriesResponse = await categoryService.getAll();
          console.log('Categories Response:', categoriesResponse);
          
          if (categoriesResponse?.success && Array.isArray(categoriesResponse.data)) {
            setCategories(categoriesResponse.data);
          } else {
            setCategories([]);
          }
      
          // Load allocations using existing dashboard endpoint
          console.log('Loading allocations from dashboard...');
          try {
            const allocationsResponse = await allocationService.getAll();
            console.log('Allocations Response:', allocationsResponse);
            
            if (allocationsResponse?.success && Array.isArray(allocationsResponse.data)) {
              setAllocations(allocationsResponse.data);
            } else {
              setAllocations([]);
            }
          } catch (error) {
            console.log('Allocations failed to load:', error);
            setAllocations([]);
          }
      
          // Load requests using existing endpoint
          console.log('Loading requests...');
          try {
            const requestsResponse = await requestService.getPending();
            console.log('Requests Response:', requestsResponse);
            
            if (requestsResponse?.success && Array.isArray(requestsResponse.data)) {
              setPendingRequests(requestsResponse.data);
            } else {
              setPendingRequests([]);
            }
          } catch (error) {
            console.log('Requests failed to load:', error);
            setPendingRequests([]);
          }
      
          // Load dashboard summary using existing endpoint
          try {
            const dashResponse = await dashboardService.getAdminSummary();
            console.log('Dashboard Response:', dashResponse);
            if (dashResponse?.success) {
              setDashboardData(dashResponse.data);
            }
          } catch (error) {
            console.log('Dashboard summary failed to load:', error);
          }
      
        } catch (error) {
          console.error('Error loading admin dashboard:', error);
          toast.error('Failed to load dashboard data');
        } finally {
          setLoading(false);
        }
    };

    const handleReviewRequest = (request) => {
        setSelectedRequest(request);
        setShowReviewModal(true);
    };

    const handleRequestReviewed = () => {
        setShowReviewModal(false);
        setSelectedRequest(null);
        loadDashboardData(); // Reload to get updated data
        toast.success('Request reviewed successfully');
    };

    const handleCategorySuccess = () => {
        setShowCategoryModal(false);
        setEditingCategory(null);
        loadDashboardData();
        toast.success('Category saved successfully');
    };

    const handleAllocationSuccess = () => {
        setShowAllocationModal(false);
        setEditingAllocation(null);
        loadDashboardData();
        toast.success('Allocation saved successfully');
    };

    // Delete category handlers
    const handleDeleteCategory = (category) => {
        setDeletingCategory(category);
        setShowDeleteModal(true);
    };

    const confirmDeleteCategory = async () => {
        if (!deletingCategory) return;

        try {
            setDeleteLoading(true);
            console.log('🗑️ Deleting category:', deletingCategory);
            
            const response = await categoryService.delete(deletingCategory.id || deletingCategory.Id);
            console.log('✅ Delete response:', response);
            
            if (response?.success) {
                toast.success(`Category "${deletingCategory.name || deletingCategory.Name}" deleted successfully`);
                setShowDeleteModal(false);
                setDeletingCategory(null);
                loadDashboardData(); // Reload to get updated data
            } else {
                toast.error(response?.message || 'Failed to delete category');
            }
        } catch (error) {
            console.error('❌ Error deleting category:', error);
            
            let errorMessage = 'Failed to delete category';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.Message) {
                errorMessage = error.response.data.Message;
            } else if (error.response?.data?.Errors?.Message) {
                errorMessage = error.response.data.Errors.Message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            toast.error(errorMessage);
        } finally {
            setDeleteLoading(false);
        }
    };
    const getCategoryName = (categoryId) => {
        const category = categories.find(c => (c.id || c.Id) === categoryId);
        return category ? (category.name || category.Name) : 'Unknown Category';
      };

    const cancelDeleteCategory = () => {
        setShowDeleteModal(false);
        setDeletingCategory(null);
    };

    const getStatusBadge = (status) => {
        const variants = {
            0: 'warning',  // Pending
            1: 'success',  // Approved
            2: 'danger'    // Rejected
        };
        const labels = {
            0: 'Pending',
            1: 'Approved',
            2: 'Rejected'
        };
        return <Badge bg={variants[status]}>{labels[status]}</Badge>;
    };

    const getUtilizationBadge = (percentage) => {
        if (percentage >= 100) return <Badge bg="danger">{percentage}%</Badge>;
        if (percentage >= 80) return <Badge bg="warning">{percentage}%</Badge>;
        if (percentage >= 60) return <Badge bg="info">{percentage}%</Badge>;
        return <Badge bg="success">{percentage}%</Badge>;
    };

    // Debug logging
    console.log('Render state:', { 
        categoriesLength: categories.length, 
        allocationsLength: allocations.length, 
        requestsLength: pendingRequests.length,
        firstCategory: categories[0]
    });

    if (loading) return <LoadingSpinner />;

    return (
        <Container fluid>
            {/* Header */}
            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h2>Admin Dashboard</h2>
                            <p className="text-muted">Welcome back, {user?.name}</p>
                        </div>
                        <div className="d-flex gap-2">
                            <Button
                                variant="primary"
                                onClick={() => setShowCategoryModal(true)}
                            >
                                <span className="me-1"></span>
                                Add Category
                            </Button>
                            <Button
                                variant="success"
                                onClick={() => setShowAllocationModal(true)}
                            >
                                <span className="me-1"></span>
                                Add Allocation
                            </Button>
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Debug Info - Remove this later
            <Row className="mb-3">
                <Col>
                    <Alert variant="info">
                        <strong>🐛 Debug Info:</strong> Categories: {categories.length}, 
                        Allocations: {allocations.length}, 
                        Requests: {pendingRequests.length}
                        {categories[0] && (
                            <div>First category: {JSON.stringify(categories[0])}</div>
                        )}
                    </Alert>
                </Col>
            </Row> */}

            {/* Summary Cards */}
            <Row className="mb-4">
                <Col lg={3} md={6} className="mb-3">
                    <Card className="h-100 border-primary">
                        <Card.Body>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="text-muted">Total Categories</h6>
                                    <h3 className="text-primary">{categories.length}</h3>
                                </div>
                                <div className="align-self-center">
                                    <span className="fs-1"></span>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={3} md={6} className="mb-3">
                    <Card className="h-100 border-success">
                        <Card.Body>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="text-muted">Active Allocations</h6>
                                    <h3 className="text-success">{allocations.length}</h3>
                                </div>
                                <div className="align-self-center">
                                    <span className="fs-1"></span>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={3} md={6} className="mb-3">
                    <Card className="h-100 border-warning">
                        <Card.Body>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="text-muted">Pending Requests</h6>
                                    <h3 className="text-warning">{pendingRequests.length}</h3>
                                </div>
                                <div className="align-self-center">
                                    <span className="fs-1"></span>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={3} md={6} className="mb-3">
                    <Card className="h-100 border-info">
                        <Card.Body>
                            <div className="d-flex justify-content-between">
                                <div>
                                    <h6 className="text-muted">Total Budget</h6>
                                    <h3 className="text-info">
                                        {formatCurrency(
                                            categories.reduce((sum, cat) => sum + (Number(cat.limit || cat.Limit) || 0), 0)
                                        )}
                                    </h3>
                                </div>
                                <div className="align-self-center">
                                    <span className="fs-1"></span>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Main Content Tabs */}
            <Row>
                <Col>
                    <Card>
                        <Card.Body>
                            <Tabs defaultActiveKey="categories" className="mb-3">
                                {/* Categories Tab */}
                                <Tab eventKey="categories" title={
                                    <span>
                                        <span className="me-1"></span>
                                        Categories ({categories.length})
                                    </span>
                                }>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h5 className="mb-0">
                                            <span className="me-2"></span>
                                            Budget Categories
                                        </h5>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => setShowCategoryModal(true)}
                                        >
                                            <span className="me-1"></span>
                                            Add Category
                                        </Button>
                                    </div>

                                    {categories.length === 0 ? (
                                        <Alert variant="info" className="text-center">
                                            <span className="fs-1"></span>
                                            <h5 className="mt-3">No categories created yet</h5>
                                            <p className="text-muted">Create your first category to get started.</p>
                                            <Button
                                                variant="primary"
                                                className="mt-2"
                                                onClick={() => setShowCategoryModal(true)}
                                            >
                                                <span className="me-1"></span>
                                                Create First Category
                                            </Button>
                                        </Alert>
                                    ) : (
                                        <Table responsive hover>
                                            <thead className="bg-light">
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Limit</th>
                                                    <th>Timeframe</th>
                                                    <th>Threshold</th>
                                                    <th>Status</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {categories.map((category) => (
                                                    <tr key={category.id || category.Id}>
                                                        <td>
                                                            <div className="d-flex align-items-center">
                                                                <span className="fw-semibold">
                                                                    {category.name || category.Name || 'N/A'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="fw-bold text-success">
                                                            {formatCurrency(category.limit || category.Limit || 0)}
                                                        </td>
                                                        <td>
                                                            <Badge bg="secondary">
                                                                {category.timeframe || category.Timeframe || 'N/A'}
                                                            </Badge>
                                                        </td>
                                                        <td>
                                                            <Badge bg="info">
                                                                {category.thresholdPercent || category.ThresholdPercent || 0}%
                                                            </Badge>
                                                        </td>
                                                        <td>
                                                            <Badge bg="success">Active</Badge>
                                                        </td>
                                                        <td>
                                                            <div className="d-flex gap-1">
                                                                <Button
                                                                    variant="outline-primary"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setEditingCategory(category);
                                                                        setShowCategoryModal(true);
                                                                    }}
                                                                    title="Edit Category"
                                                                >
                                                                    <span className="me-1"></span>
                                                                    Edit
                                                                </Button>
                                                                <Button
                                                                    variant="outline-danger"
                                                                    size="sm"
                                                                    onClick={() => handleDeleteCategory(category)}
                                                                    title="Delete Category"
                                                                >
                                                                    <span className="me-1"></span>
                                                                    Delete
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    )}

                                    <div className="text-end">
                                        <Link to="/categories" className="btn btn-outline-primary">
                                            <span className="me-1"></span>
                                            Manage All Categories
                                        </Link>
                                    </div>
                                </Tab>

                                {/* Allocations Tab */}
                                <Tab eventKey="allocations" title={
                                    <span>
                                        <span className="me-1"></span>
                                        Allocations ({allocations.length})
                                    </span>
                                }>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h5 className="mb-0">Budget Allocations</h5>
                                        <Button
                                            variant="success"
                                            size="sm"
                                            onClick={() => setShowAllocationModal(true)}
                                        >
                                            <span className="me-1"></span>
                                            Add Allocation
                                        </Button>
                                    </div>

                                    {allocations.length === 0 ? (
                                        <Alert variant="info" className="text-center">
                                            <span className="fs-1"></span>
                                            <h5 className="mt-3">No budget allocations created yet</h5>
                                            <p className="text-muted">Create the first allocation to get started.</p>
                                            <Button
                                                variant="success"
                                                className="mt-2"
                                                onClick={() => setShowAllocationModal(true)}
                                            >
                                                <span className="me-1"></span>
                                                Create First Allocation
                                            </Button>
                                        </Alert>
                                    ) : (
                                        <Table responsive hover>
                                            <thead>
                                                <tr>
                                                    <th>Department</th>
                                                    <th>Category</th>
                                                    <th>Allocated</th>
                                                    <th>Spent</th>
                                                    <th>Utilization</th>
                                                    <th>Created</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {allocations.map((allocation) => {
                                                    const utilization = allocation.amount > 0
                                                        ? Math.round((allocation.spent / allocation.amount) * 100)
                                                        : 0;
                                                    return (
                                                        <tr key={allocation.id}>
                                                            <td>
                                                                <span className="fw-semibold">{allocation.departmentName}</span>
                                                            </td>
                                                            <td>{allocation.categoryName || getCategoryName(allocation.categoryId)}</td>
                                                            <td className="fw-bold text-primary">
                                                                {formatCurrency(allocation.amount)}
                                                            </td>
                                                            <td className="fw-bold text-success">
                                                                {formatCurrency(allocation.spent)}
                                                            </td>
                                                            <td>
                                                                {getUtilizationBadge(utilization)}
                                                            </td>
                                                            <td>{formatDate(allocation.createdAt)}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </Table>
                                    )}

                                    <div className="text-end">
                                        <Link to="/allocations" className="btn btn-outline-primary">
                                            <span className="me-1"></span>
                                            Manage All Allocations
                                        </Link>
                                    </div>
                                </Tab>

                                {/* Pending Requests Tab */}
                                <Tab eventKey="requests" title={
                                    <span>
                                        <span className="me-1"></span>
                                        Pending Requests ({pendingRequests.length})
                                    </span>
                                }>
                                    {pendingRequests.length === 0 ? (
                                        <Alert variant="info" className="text-center">
                                            <span className="fs-1"></span>
                                            <h5 className="mt-3">All caught up!</h5>
                                            <p className="text-muted">No pending requests at this time.</p>
                                        </Alert>
                                    ) : (
                                        <>
                                            <div className="mb-3">
                                                <h5>Requests Awaiting Your Review</h5>
                                                <p className="text-muted">Review and approve or reject budget adjustment requests from departments.</p>
                                            </div>
                                            
                                            <Table responsive hover>
                                                <thead className="bg-light">
                                                    <tr>
                                                        <th>Department</th>
                                                        <th>Category</th>
                                                        <th>Amount Requested</th>
                                                        <th>Reason</th>
                                                        <th>Submitted</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {pendingRequests.map((request) => (
                                                        <tr key={request.id || request.Id}>
                                                            <td>
                                                                <span className="fw-semibold">
                                                                    {request.departmentName || request.DepartmentName || 'Unknown Department'}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <Badge bg="secondary">
                                                                    {request.categoryName || request.CategoryName || 'Unknown Category'}
                                                                </Badge>
                                                            </td>
                                                            <td className="fw-bold text-success">
                                                                {formatCurrency(request.amount || request.Amount || 0)}
                                                            </td>
                                                            <td>
                                                                <div className="text-truncate" style={{ maxWidth: '200px' }} 
                                                                     title={request.reason || request.Reason}>
                                                                    {request.reason || request.Reason || 'No reason provided'}
                                                                </div>
                                                            </td>
                                                            <td>{formatDate(request.createdAt || request.CreatedAt)}</td>
                                                            <td>
                                                                <Button
                                                                    variant="primary"
                                                                    size="sm"
                                                                    onClick={() => handleReviewRequest(request)}
                                                                    title="Review Request"
                                                                >
                                                                    <span className="me-1"></span>
                                                                    Review
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </>
                                    )}
                                    
                                    <div className="text-end mt-3">
                                        <Link to="/requests" className="btn btn-outline-primary">
                                            <span className="me-1"></span>
                                            View All Requests
                                        </Link>
                                    </div>
                                </Tab>

                                {/* Analytics Tab
                                <Tab eventKey="analytics" title={
                                    <span>
                                        <span className="me-1"></span>
                                        Analytics
                                    </span>
                                }>
                                    <div className="text-center py-5">
                                        <span className="fs-1"></span>
                                        <h4 className="mt-3">Analytics Dashboard</h4>
                                        <p className="text-muted">
                                            Advanced analytics and reporting features coming soon.
                                        </p>
                                        <Link to="/analytics" className="btn btn-primary">
                                            <span className="me-1"></span>
                                            View Full Analytics
                                        </Link>
                                    </div>
                                </Tab> */}

                            </Tabs>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={cancelDeleteCategory} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <span className="me-2"></span>
                        Confirm Delete Category
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {deletingCategory && (
                        <div>
                            <Alert variant="warning">
                                <span className="me-2"></span>
                                <strong>Warning!</strong> This action cannot be undone.
                            </Alert>
                            
                            <p>Are you sure you want to delete the category:</p>
                            
                            <div className="bg-light p-3 rounded">
                                <h6 className="fw-bold">
                                     {deletingCategory.name || deletingCategory.Name}
                                </h6>
                                <div className="small text-muted">
                                    <div>Limit: {formatCurrency(deletingCategory.limit || deletingCategory.Limit || 0)}</div>
                                    <div>Timeframe: {deletingCategory.timeframe || deletingCategory.Timeframe}</div>
                                    <div>Threshold: {deletingCategory.thresholdPercent || deletingCategory.ThresholdPercent || 0}%</div>
                                </div>
                            </div>
                            
                            <p className="mt-3 text-muted small">
                                <span className="me-1"></span>
                                <strong>Note:</strong> Deleting this category will also remove any associated allocations and may affect pending requests.
                            </p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button 
                        variant="secondary" 
                        onClick={cancelDeleteCategory}
                        disabled={deleteLoading}
                    >
                        <span className="me-1"></span>
                        Cancel
                    </Button>
                    <Button 
                        variant="danger" 
                        onClick={confirmDeleteCategory}
                        disabled={deleteLoading}
                    >
                        {deleteLoading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <span className="me-1"></span>
                                Delete Category
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Existing Modals */}
            <CategoryModal
                show={showCategoryModal}
                onHide={() => {
                    setShowCategoryModal(false);
                    setEditingCategory(null);
                }}
                onSuccess={handleCategorySuccess}
                category={editingCategory}
            />

            <AllocationModal
                show={showAllocationModal}
                onHide={() => {
                    setShowAllocationModal(false);
                    setEditingAllocation(null);
                }}
                onSuccess={handleAllocationSuccess}
                allocation={editingAllocation}
            />

            <ReviewModal
                show={showReviewModal}
                onHide={() => {
                    setShowReviewModal(false);
                    setSelectedRequest(null);
                }}
                onSuccess={handleRequestReviewed}
                request={selectedRequest}
            />
        </Container>
    );
};

export default AdminDashboard;
