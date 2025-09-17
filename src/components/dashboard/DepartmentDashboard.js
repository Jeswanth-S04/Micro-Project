import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Alert, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { allocationService } from '../../services/allocationService';
import { requestService } from '../../services/requestService';
import { managementService } from '../../services/managementService';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { toast } from 'react-toastify';
import RequestModal from '../requests/RequestModal';
import LoadingSpinner from '../common/LoadingSpinner';

const DepartmentDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [allocations, setAllocations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [showRequestModal, setShowRequestModal] = useState(false);

  console.log('🔍 DepartmentDashboard: User info:', {
    user,
    departmentId: user?.departmentId,
    role: user?.role
  });

  useEffect(() => {
    loadDashboardData();
  }, [user?.departmentId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading department dashboard data...');
      
      const results = await Promise.allSettled([
        managementService.getDashboard(), // Use management data and filter for current department
        allocationService.getByDepartment(user?.departmentId || 1),
        requestService.getByDepartment(user?.departmentId || 1)
      ]);

      // Handle management dashboard data and filter for current department
      if (results[0].status === 'fulfilled' && results[0].value?.success) {
        const managementData = results[0].value.data;
        console.log('✅ Management data loaded:', managementData);
        
        // Extract data for current department
        const currentDeptData = extractDepartmentData(managementData, user?.departmentId || 1);
        console.log('✅ Current department data:', currentDeptData);
        setDashboardData(currentDeptData);
      } else if (results[0].status === 'fulfilled' && results[0].value?.Success) {
        // Handle uppercase response
        const managementData = results[0].value.Data;
        console.log('✅ Management data loaded (uppercase):', managementData);
        
        const currentDeptData = extractDepartmentData(managementData, user?.departmentId || 1);
        console.log('✅ Current department data (uppercase):', currentDeptData);
        setDashboardData(currentDeptData);
      } else {
        console.log('❌ Dashboard data failed:', results[0].reason);
        setDashboardData(null);
      }

      // Handle allocations
      if (results[1].status === 'fulfilled' && results[1].value?.success) {
        const allocationsData = results[1].value.data;
        console.log('✅ Allocations loaded:', allocationsData);
        
        if (Array.isArray(allocationsData)) {
          setAllocations(allocationsData);
        } else {
          console.log('⚠️ Allocations data is not an array:', allocationsData);
          setAllocations([]);
        }
      } else if (results[1].status === 'fulfilled' && results[1].value?.Success) {
        // Handle uppercase response
        const allocationsData = results[1].value.Data || [];
        console.log('✅ Allocations loaded (uppercase):', allocationsData);
        setAllocations(Array.isArray(allocationsData) ? allocationsData : []);
      } else {
        console.log('❌ Allocations failed:', results[1].reason);
        setAllocations([]);
      }

      // Handle requests
      if (results[2].status === 'fulfilled' && results[2].value?.success) {
        const requestsData = results[2].value.data;
        console.log('✅ Requests loaded:', requestsData);
        
        if (Array.isArray(requestsData)) {
          setRequests(requestsData);
        } else {
          console.log('⚠️ Requests data is not an array:', requestsData);
          setRequests([]);
        }
      } else if (results[2].status === 'fulfilled' && results[2].value?.Success) {
        // Handle uppercase response
        const requestsData = results[2].value.Data || [];
        console.log('✅ Requests loaded (uppercase):', requestsData);
        setRequests(Array.isArray(requestsData) ? requestsData : []);
      } else {
        console.log('❌ Requests failed:', results[2].reason);
        setRequests([]);
      }

    } catch (error) {
      console.error('❌ Error loading department dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Extract department-specific data from management dashboard
  const extractDepartmentData = (managementData, departmentId) => {
    if (!managementData) return null;

    const summary = managementData.Summary || managementData.summary;
    const departments = summary?.Departments || summary?.departments || [];
    
    // Find current department
    const currentDept = departments.find(d => 
      (d.DepartmentId || d.departmentId) === departmentId
    );

    if (!currentDept) return null;

    // Extract relevant data
    return {
      department: {
        id: currentDept.DepartmentId || currentDept.departmentId,
        name: currentDept.DepartmentName || currentDept.departmentName,
        totalAllocation: currentDept.TotalAllocation || currentDept.totalAllocation || 0,
        totalSpent: currentDept.TotalSpent || currentDept.totalSpent || 0,
        balance: currentDept.Balance || currentDept.balance || 0,
        categories: currentDept.Categories || currentDept.categories || []
      },
      utilization: managementData.UtilizationTrends?.find(u => 
        (u.DepartmentId || u.departmentId) === departmentId
      ) || managementData.utilizationTrends?.find(u => 
        (u.DepartmentId || u.departmentId) === departmentId
      ),
      recentRequests: (managementData.RecentRequests || managementData.recentRequests || [])
        .filter(r => (r.DepartmentName || r.departmentName) === (currentDept.DepartmentName || currentDept.departmentName))
        .slice(0, 5)
    };
  };

  const handleRequestSuccess = () => {
    setShowRequestModal(false);
    loadDashboardData();
    toast.success('Request submitted successfully');
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
    return <Badge bg={variants[status] || 'secondary'}>{labels[status] || 'Unknown'}</Badge>;
  };

  const calculateUtilization = (spent, allocated) => {
    if (!allocated || allocated === 0) return 0;
    return Math.round((spent / allocated) * 100);
  };

  const getUtilizationVariant = (percentage) => {
    if (percentage >= 100) return 'danger';
    if (percentage >= 80) return 'warning';
    if (percentage >= 60) return 'info';
    return 'success';
  };

  // Use dashboard data for categories if available, otherwise use allocations
  const categoryData = dashboardData?.department?.categories || [];
  const departmentAllocations = categoryData.length > 0 ? categoryData.map(cat => ({
    id: cat.CategoryId || cat.categoryId,
    categoryName: cat.CategoryName || cat.categoryName,
    amount: cat.Allocation || cat.allocation || 0,
    spent: cat.Spent || cat.spent || 0,
    balance: cat.Balance || cat.balance || 0,
    thresholdPercent: cat.ThresholdPercent || cat.thresholdPercent || 0,
    nearingLimit: cat.NearingLimit || cat.nearingLimit || false,
    exceeded: cat.Exceeded || cat.exceeded || false
  })) : allocations;

  if (loading) return <LoadingSpinner />;

  return (
    <Container fluid>
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>Department Dashboard</h2>
              <p className="text-muted">
                Welcome back, {user?.name}
                {dashboardData?.department?.name && (
                  <span className="ms-2">
                    • <strong>{dashboardData.department.name} Department</strong>
                  </span>
                )}
              </p>
            </div>
            <Button variant="success" onClick={() => setShowRequestModal(true)}>
              <span className="me-1"></span>
              New Request
            </Button>
          </div>
        </Col>
      </Row>

      {/* Debug Info */}
      <Row className="mb-4">
        <Col>
          {/* <Alert variant="info">
            <strong>🐛 Debug Info:</strong> 
            Allocations: {departmentAllocations.length} | 
            Requests: {requests.length} | 
            Department: {dashboardData?.department?.name || 'Not found'}
            {dashboardData && (
              <details className="mt-2">
                <summary style={{ cursor: 'pointer' }}>Show Department Data</summary>
                <pre className="mt-2 small" style={{ maxHeight: '200px', overflow: 'auto' }}>
                  {JSON.stringify(dashboardData, null, 2)}
                </pre>
              </details>
            )}
          </Alert> */}
        </Col>
      </Row>

      {/* Summary Cards */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <Card className="h-100 border-primary">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="text-muted">Total Allocated</h6>
                  <h3 className="text-primary">
                    {formatCurrency(
                      dashboardData?.department?.totalAllocation || 
                      departmentAllocations.reduce((sum, alloc) => sum + (alloc.amount || 0), 0)
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

        <Col lg={3} md={6} className="mb-3">
          <Card className="h-100 border-success">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="text-muted">Total Spent</h6>
                  <h3 className="text-success">
                    {formatCurrency(
                      dashboardData?.department?.totalSpent || 
                      departmentAllocations.reduce((sum, alloc) => sum + (alloc.spent || 0), 0)
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

        {/* <Col lg={3} md={6} className="mb-3">
          <Card className="h-100 border-info">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="text-muted">Balance</h6>
                  <h3 className="text-info">
                    {formatCurrency(
                      dashboardData?.department?.balance || 
                      (dashboardData?.department?.totalAllocation || 0) - (dashboardData?.department?.totalSpent || 0)
                    )}
                  </h3>
                </div>
                <div className="align-self-center">
                  <span className="fs-1"></span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col> */}

        <Col lg={3} md={6} className="mb-3">
          <Card className="h-100 border-warning">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="text-muted">My Requests</h6>
                  <h3 className="text-warning">{requests.length}</h3>
                </div>
                <div className="align-self-center">
                  <span className="fs-1"></span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Utilization Overview */}
      {dashboardData?.utilization && (
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-1">
                      <span className="me-2"></span>
                      Department Utilization
                    </h5>
                    <p className="text-muted mb-0">Overall budget utilization for your department</p>
                  </div>
                  <div className="text-end">
                    <h2 className={`mb-0 ${dashboardData.utilization.IsHighUtilization ? 'text-danger' : 'text-success'}`}>
                      {(dashboardData.utilization.UtilizationPercentage || dashboardData.utilization.utilizationPercentage || 0).toFixed(1)}%
                    </h2>
                    <small className="text-muted">
                      {dashboardData.utilization.IsHighUtilization || dashboardData.utilization.isHighUtilization 
                        ? 'High Utilization' 
                        : 'Good Utilization'}
                    </small>
                  </div>
                </div>
                <ProgressBar 
                  now={dashboardData.utilization.UtilizationPercentage || dashboardData.utilization.utilizationPercentage || 0}
                  variant={dashboardData.utilization.IsHighUtilization || dashboardData.utilization.isHighUtilization ? 'danger' : 'success'}
                  className="mt-3"
                  style={{ height: '10px' }}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Main Content */}
      <Row>
        {/* Budget Allocations */}
        <Col lg={8} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <span className="me-2"></span>
                Budget Categories
              </h5>
            </Card.Header>
            <Card.Body>
              {departmentAllocations.length === 0 ? (
                <Alert variant="info" className="text-center">
                  <span className="fs-1"></span>
                  <h5 className="mt-3">No Budget Allocations</h5>
                  <p className="text-muted">
                    No budget has been allocated to your department yet. 
                    Contact your Finance Admin for budget allocation.
                  </p>
                </Alert>
              ) : (
                <Table responsive hover>
                  <thead className="bg-light">
                    <tr>
                      <th>Category</th>
                      <th>Allocated</th>
                      <th>Spent</th>
                      <th>Remaining</th>
                      <th>Utilization</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departmentAllocations.map((allocation) => {
                      const allocated = allocation.amount || 0;
                      const spent = allocation.spent || 0;
                      const remaining = allocated - spent;
                      const utilization = calculateUtilization(spent, allocated);
                      const nearingLimit = allocation.nearingLimit || utilization >= (allocation.thresholdPercent || 80);
                      const exceeded = allocation.exceeded || utilization >= 100;
                      
                      return (
                        <tr key={allocation.id || allocation.categoryName}>
                          <td>
                            <div className="d-flex align-items-center">
                              <span className="fw-semibold">
                                {allocation.categoryName || 'Unknown Category'}
                              </span>
                            </div>
                          </td>
                          <td className="fw-bold text-primary">
                            {formatCurrency(allocated)}
                          </td>
                          <td className="fw-bold text-success">
                            {formatCurrency(spent)}
                          </td>
                          <td className="fw-bold">
                            <span className={remaining >= 0 ? 'text-success' : 'text-danger'}>
                              {formatCurrency(remaining)}
                            </span>
                          </td>
                          <td>
                            <div style={{ minWidth: '120px' }}>
                              <ProgressBar 
                                now={Math.min(utilization, 100)} 
                                variant={getUtilizationVariant(utilization)}
                                className="mb-1"
                                style={{ height: '8px' }}
                              />
                              <small className="text-muted">{utilization}%</small>
                            </div>
                          </td>
                          <td>
                            {exceeded && <Badge bg="danger">Exceeded</Badge>}
                            {nearingLimit && !exceeded && <Badge bg="warning">Near Limit</Badge>}
                            {!nearingLimit && !exceeded && <Badge bg="success">Good</Badge>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Recent Requests */}
        <Col lg={4} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <span className="me-2"></span>
                Recent Requests
              </h5>
            </Card.Header>
            <Card.Body>
              {(dashboardData?.recentRequests?.length > 0 ? dashboardData.recentRequests : requests).length === 0 ? (
                <Alert variant="info" className="text-center">
                  <span className="fs-1"></span>
                  <h6 className="mt-2">No Requests Yet</h6>
                  <p className="text-muted small">
                    Submit your first budget request.
                  </p>
                  <Button 
                    variant="success" 
                    size="sm"
                    onClick={() => setShowRequestModal(true)}
                  >
                    <span className="me-1"></span>
                    New Request
                  </Button>
                </Alert>
              ) : (
                <>
                  {(dashboardData?.recentRequests?.length > 0 ? dashboardData.recentRequests : requests.slice(0, 5)).map((request) => (
                    <div 
                      key={request.id || request.Id} 
                      className="border-bottom py-3"
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <h6 className="mb-1">
                            {request.categoryName || request.CategoryName || 'Unknown Category'}
                          </h6>
                          <p className="text-muted small mb-1">
                            {request.reason || request.Reason || 'No reason provided'}
                          </p>
                          <small className="text-muted">
                            {formatDate(request.createdAt || request.CreatedAt)}
                          </small>
                        </div>
                        <div className="ms-3 text-end">
                          <div className="fw-bold text-success">
                            {formatCurrency(request.amount || request.Amount || 0)}
                          </div>
                          {getStatusBadge(request.status ?? request.Status)}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="text-center mt-3">
                    <Link to="/requests" className="btn btn-outline-primary btn-sm">
                      <span className="me-1"></span>
                      View All Requests
                    </Link>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Request Modal */}
      <RequestModal
        show={showRequestModal}
        onHide={() => setShowRequestModal(false)}
        onSuccess={handleRequestSuccess}
        departmentId={user?.departmentId}
      />
    </Container>
  );
};

export default DepartmentDashboard;
