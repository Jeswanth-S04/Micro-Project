
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Badge, Tab, Tabs, Alert } from 'react-bootstrap';
import { requestService } from '../../services/requestService';
import LoadingSpinner from '../common/LoadingSpinner';
import RequestModal from './RequestModal';
import ReviewModal from './ReviewModal';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import CategoryModal from '../categories/CategoryModal';
import {categoryService} from '../../services/categoryService';

// Constants
const REQUEST_STATUS_LABELS = {
    0: 'Pending',
    1: 'Approved',
    2: 'Rejected'
};

const USER_ROLES = {
    FINANCE_ADMIN: 1,
    DEPARTMENT_HEAD: 2,
    MANAGEMENT: 3
};

const RequestList = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [error, setError] = useState('');
    const [categories, setCategories] = useState([]);

    const isDepartmentHead = user?.role === USER_ROLES.DEPARTMENT_HEAD;
    const isFinanceAdmin = user?.role === USER_ROLES.FINANCE_ADMIN;
    const isManagement = user?.role === USER_ROLES.MANAGEMENT;

    console.log('RequestList Debug:', {
        user,
        isDepartmentHead,
        isFinanceAdmin,
        isManagement,
        requestsLength: requests.length,
        departmentId: user?.departmentId,
        userRole: user?.role
    });

    useEffect(() => {
        loadRequests();
    }, [isDepartmentHead, isFinanceAdmin, user?.departmentId]);

    const loadRequests = async () => {
        try {
            setLoading(true);
            setError('');
            console.log('Loading requests...', {
                isDepartmentHead,
                isFinanceAdmin,
                isManagement,
                departmentId: user?.departmentId
            });

            let response;

            try {
                if (isDepartmentHead && user?.departmentId) {
                    // Use department-specific endpoint for department heads
                    console.log('Loading department requests for department:', user.departmentId);
                    response = await requestService.getByDepartment(user.departmentId);
                } else if (isFinanceAdmin) {
                    // Try pending first, then fall back to all requests
                    console.log('Loading requests for finance admin');
                    try {
                        response = await requestService.getPending();
                    } catch (pendingError) {
                        console.log('Pending requests failed, trying alternative approach:', pendingError);
                        // If pending fails, try getting all requests another way
                        response = await requestService.getByDepartment(1); // Try with department 1 as fallback
                    }
                } else if (isManagement) {
                    // Management can see all requests
                    console.log('Loading requests for management');
                    try {
                        response = await requestService.getPending();
                    } catch (managementError) {
                        console.log('Management requests failed:', managementError);
                        response = { Success: true, Data: [] };
                    }
                } else {
                    // Fallback for other roles
                    console.log('Loading requests (fallback)');
                    response = { Success: true, Data: [] };
                }
            } catch (apiError) {
                console.error('API Error:', apiError);
                if (apiError.response?.status === 403) {
                    setError('Access denied. You do not have permission to view requests.');
                } else {
                    setError('Failed to load requests. Please try again.');
                }
                response = { Success: true, Data: [] };
            }

            console.log('Requests API Response:', response);

            if (response?.success && Array.isArray(response.data)) {
                console.log('Setting requests (lowercase):', response.data);
                setRequests(response.data);
            } else if (response?.Success && Array.isArray(response.Data)) {
                // Handle uppercase response format
                console.log('Setting requests (uppercase format):', response.Data);
                setRequests(response.Data);
            } else if (response?.Success && response.Data === null) {
                // Handle null data
                console.log('No requests found');
                setRequests([]);
            } else {
                console.log('Invalid response format:', response);
                setRequests([]);
            }
        } catch (error) {
            console.error('Error loading requests:', error);
            setRequests([]);
            if (error.response?.status === 403) {
                setError('Access denied. You do not have permission to view requests.');
                toast.error('Access denied. Please check your permissions.');
            } else {
                setError('Failed to load requests. Please try again.');
                toast.error('Failed to load requests');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleReview = (request) => {
        setSelectedRequest(request);
        setShowReviewModal(true);
    };

    const getCategoryName = (categoryId) => {
        const category = categories.find(c => (c.id || c.Id) === categoryId);
        return category ? (category.name || category.Name) : 'Unknown Category';
      };


    const handleReviewSuccess = () => {
        setShowReviewModal(false);
        setSelectedRequest(null);
        loadRequests();
        toast.success('Request reviewed successfully');
    };

    const getStatusBadge = (status) => {
        const variants = { 0: 'warning', 1: 'success', 2: 'danger' };
        return (
            <Badge bg={variants[status] || 'secondary'}>
                {REQUEST_STATUS_LABELS[status] || 'Unknown'}
            </Badge>
        );
    };

    // Enhanced filtering with debugging
    const filteredRequests = React.useMemo(() => {
        console.log('Filtering requests:', { activeTab, totalRequests: requests.length });

        const filtered = requests.filter(request => {
            // Handle both uppercase and lowercase property names
            const status = request.status ?? request.Status ?? 0;

            if (activeTab === 'all') return true;
            if (activeTab === 'pending') return status === 0;
            if (activeTab === 'approved') return status === 1;
            if (activeTab === 'rejected') return status === 2;
            return true;
        });

        console.log('Filtered requests:', { activeTab, filteredCount: filtered.length });
        return filtered;
    }, [requests, activeTab]);

    // Calculate counts for tabs
    const statusCounts = React.useMemo(() => {
        const counts = { pending: 0, approved: 0, rejected: 0 };
        requests.forEach(request => {
            const status = request.status ?? request.Status ?? 0;
            if (status === 0) counts.pending++;
            else if (status === 1) counts.approved++;
            else if (status === 2) counts.rejected++;
        });
        return counts;
    }, [requests]);

    if (loading) return <LoadingSpinner />;

    return (
        <div>
            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h2>Adjustment Requests</h2>
                            <p className="text-muted">
                                {isDepartmentHead && 'Manage your department budget adjustment requests'}
                                {isFinanceAdmin && 'Review and approve budget adjustment requests'}
                                {isManagement && 'View all budget adjustment requests'}
                                {!isDepartmentHead && !isFinanceAdmin && !isManagement && 'View budget adjustment requests'}
                            </p>
                        </div>
                        {isDepartmentHead && (
                            <Button
                                variant="primary"
                                onClick={() => setShowRequestModal(true)}
                            >
                                New Request
                            </Button>
                        )}
                    </div>
                </Col>
            </Row>

            {/* Error Alert */}
            {error && (
                <Row className="mb-4">
                    <Col>
                        <Alert variant="danger" onClose={() => setError('')} dismissible>
                            <Alert.Heading>Access Error</Alert.Heading>
                            <p>{error}</p>
                            <hr />
                            <div className="d-flex justify-content-end">
                                <Button variant="outline-danger" size="sm" onClick={loadRequests}>
                                    Try Again
                                </Button>
                            </div>
                        </Alert>
                    </Col>
                </Row>
            )}

            {/* Debug Info
            <Row className="mb-3">
                <Col>
                    <Alert variant="info">
                        <strong>Debug Info:</strong> Total Requests: {requests.length} |
                        Filtered: {filteredRequests.length} |
                        Active Tab: {activeTab} |
                        User Role: {user?.role} ({isDepartmentHead ? 'Dept Head' : isFinanceAdmin ? 'Finance Admin' : isManagement ? 'Management' : 'Other'}) |
                        Department ID: {user?.departmentId}
                        {error && <span className="ms-2 text-danger">| Error: {error}</span>}

                        {requests.length > 0 && (
                            <details className="mt-2">
                                <summary style={{ cursor: 'pointer' }}>Show First Request Data</summary>
                                <pre className="mt-1" style={{ fontSize: '0.75rem', maxHeight: '200px', overflow: 'auto' }}>
                                    {JSON.stringify(requests[0], null, 2)}
                                </pre>
                            </details>
                        )}
                    </Alert> */}
                {/* </Col>
            </Row> */}

            <Row>
                <Col>
                    <Card>
                        <Card.Header>
                            <Tabs
                                activeKey={activeTab}
                                onSelect={(k) => setActiveTab(k)}
                                className="border-0"
                            >
                                <Tab eventKey="all" title={`All Requests (${requests.length})`} />
                                <Tab eventKey="pending" title={`Pending (${statusCounts.pending})`} />
                                {/* <Tab eventKey="approved" title={`Approved (${statusCounts.approved})`} />
                                <Tab eventKey="rejected" title={`Rejected (${statusCounts.rejected})`} /> */}
                            </Tabs>
                        </Card.Header>
                        <Card.Body>
                            {error && !loading ? (
                                <div className="text-center py-5">
                                    <h5 className="text-danger">Access Restricted</h5>
                                    <p className="text-muted">You don't have permission to view requests.</p>
                                    <Button variant="primary" onClick={loadRequests}>
                                        Retry
                                    </Button>
                                </div>
                            ) : filteredRequests.length === 0 ? (
                                <div className="text-center py-5">
                                    <h5 className="mt-3 text-muted">No requests found</h5>
                                    <p className="text-muted">
                                        {activeTab === 'all' && requests.length === 0 && 'No requests have been created yet'}
                                        {activeTab === 'all' && requests.length > 0 && 'All requests are filtered out'}
                                        {activeTab !== 'all' && `No ${activeTab} requests found`}
                                    </p>
                                    {isDepartmentHead && activeTab === 'all' && requests.length === 0 && (
                                        <Button variant="primary" onClick={() => setShowRequestModal(true)}>
                                            Create First Request
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <Table responsive hover>
                                    <thead className="bg-light">
                                        <tr>
                                            <th>Amount</th>
                                            <th>Reason</th>
                                            <th>Category</th>
                                            {(isFinanceAdmin || isManagement) && <th>Department</th>}
                                            <th>Status</th>
                                            <th>Created</th>
                                            <th>Reviewed</th>
                                            {isFinanceAdmin && <th>Actions</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredRequests.map((request, index) => {
                                            // Handle both uppercase and lowercase properties
                                            const id = request.id || request.Id || index;
                                            const amount = request.amount || request.Amount || 0;
                                            const reason = request.reason || request.Reason || 'No reason provided';
                                            const categoryName = request.categoryName || request.categoryName  ||categories.Name || getCategoryName(categories.categoryId) || 'unknown Category';
                                            const departmentName = request.departmentName || request.DepartmentName || 'Unknown Department';
                                            const status = request.status ?? request.Status ?? 0;
                                            const createdAt = request.createdAt || request.CreatedAt;
                                            const reviewedAt = request.reviewedAt || request.ReviewedAt;
                                            const reviewerNote = request.reviewerNote || request.ReviewerNote;

                                            return (
                                                <tr key={id}>
                                                    <td>
                                                        <h6 className="mb-0 text-success">{formatCurrency(amount)}</h6>
                                                    </td>
                                                    <td>
                                                        <div className="text-truncate" style={{ maxWidth: '250px' }} title={reason}>
                                                            {reason}
                                                        </div>
                                                        {reviewerNote && (
                                                            <small className="text-muted d-block mt-1">
                                                                <strong>Note:</strong> {reviewerNote}
                                                            </small>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <Badge bg="secondary">{categoryName}</Badge>
                                                    </td>
                                                    {(isFinanceAdmin || isManagement) && (
                                                        <td>
                                                            <small className="text-muted">{departmentName}</small>
                                                        </td>
                                                    )}
                                                    <td>{getStatusBadge(status)}</td>
                                                    <td>
                                                        <small>{formatDate(createdAt)}</small>
                                                    </td>
                                                    <td>
                                                        {reviewedAt
                                                            ? <small>{formatDate(reviewedAt)}</small>
                                                            : <span className="text-muted small">Pending</span>
                                                        }
                                                    </td>
                                                    {isFinanceAdmin && (
                                                        <td>
                                                            {status === 0 ? (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline-primary"
                                                                    onClick={() => handleReview(request)}
                                                                >
                                                                    Review
                                                                </Button>
                                                            ) : (
                                                                <span className="text-muted small">Reviewed</span>
                                                            )}
                                                        </td>
                                                    )}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Request Form Modal */}
            <RequestModal
                show={showRequestModal}
                onHide={() => setShowRequestModal(false)}
                onSuccess={() => {
                    setShowRequestModal(false);
                    loadRequests();
                    toast.success('Request created successfully');
                }}
                departmentId={user?.departmentId}
            />

            {/* Review Modal */}
            {selectedRequest && (
                <ReviewModal
                    show={showReviewModal}
                    onHide={() => setShowReviewModal(false)}
                    request={selectedRequest}
                    onSuccess={handleReviewSuccess}
                />
            )}
        </div>
    );
};

export default RequestList;
