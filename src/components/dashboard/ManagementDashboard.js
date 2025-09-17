import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Badge, Alert, Button } from 'react-bootstrap';
import { managementService } from '../../services/managementService';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatCurrency } from '../../utils/helpers';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { toast } from 'react-toastify';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// Chart colors
const CHART_COLORS = [
  '#FF6384',
  '#36A2EB', 
  '#FFCE56',
  '#4BC0C0',
  '#9966FF',
  '#FF9F40'
];

const ManagementDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rawApiResponse, setRawApiResponse] = useState(null);

  console.log('🔍 ManagementDashboard: Current state:', {
    dashboard,
    performance,
    loading,
    error,
    rawApiResponse
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 Loading management dashboard data...');
      
      const dashboardResponse = await managementService.getDashboard();
      
      console.log('✅ Raw Dashboard response:', dashboardResponse);
      setRawApiResponse(dashboardResponse);

      // Handle dashboard data with enhanced logging
      if (dashboardResponse?.Success) {
        console.log('✅ Success flag found, processing Data...');
        const data = dashboardResponse.Data;
        console.log('✅ Extracted Data:', data);
        setDashboard(data);
      } else if (dashboardResponse?.success) {
        console.log('✅ success flag found, processing data...');
        const data = dashboardResponse.data;
        console.log('✅ Extracted data:', data);
        setDashboard(data);
      } else {
        console.log('❌ No success flag found in response:', dashboardResponse);
        setError('Invalid response format from server');
      }

      // Try to load performance data
      try {
        const performanceResponse = await managementService.getDepartmentPerformance();
        console.log('✅ Performance response:', performanceResponse);
        
        if (performanceResponse?.Success && Array.isArray(performanceResponse.Data)) {
          setPerformance(performanceResponse.Data);
        } else if (performanceResponse?.success && Array.isArray(performanceResponse.data)) {
          setPerformance(performanceResponse.data);
        } else {
          console.log('⚠️ Performance data not available or not array');
          setPerformance([]);
        }
      } catch (perfError) {
        console.log('⚠️ Performance endpoint not available:', perfError.message);
        setPerformance([]);
      }

    } catch (error) {
      console.error('❌ Error loading management dashboard:', error);
      setError(`Failed to load dashboard: ${error.message}`);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getBudgetDistributionData = () => {
    console.log('🔍 getBudgetDistributionData called');
    console.log('🔍 Dashboard object:', dashboard);
    
    if (!dashboard) {
      console.log('❌ No dashboard object');
      return null;
    }

    // Check different possible paths
    const summary = dashboard.Summary || dashboard.summary;
    console.log('🔍 Summary object:', summary);
    
    if (!summary) {
      console.log('❌ No summary object');
      return null;
    }

    const departments = summary.Departments || summary.departments;
    console.log('🔍 Departments array:', departments);
    
    if (!departments || !Array.isArray(departments) || departments.length === 0) {
      console.log('❌ No departments data or not an array');
      return null;
    }

    console.log('✅ Creating pie chart data for departments:', departments.length);

    const labels = departments.map(d => {
      const name = d.DepartmentName || d.departmentName;
      console.log('📍 Department name:', name);
      return name;
    });

    const data = departments.map(d => {
      const allocation = d.TotalAllocation || d.totalAllocation || 0;
      console.log('📍 Department allocation:', allocation);
      return allocation;
    });

    console.log('✅ Chart labels:', labels);
    console.log('✅ Chart data:', data);

    return {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: CHART_COLORS.slice(0, departments.length),
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };
  };

  const getUtilizationData = () => {
    console.log('🔍 getUtilizationData called');
    
    if (!dashboard) {
      console.log('❌ No dashboard object for utilization');
      return null;
    }

    const utilization = dashboard.UtilizationTrends || dashboard.utilizationTrends;
    console.log('🔍 Utilization trends:', utilization);
    
    if (!utilization || !Array.isArray(utilization) || utilization.length === 0) {
      console.log('❌ No utilization data or not an array');
      return null;
    }

    console.log('✅ Creating bar chart data for utilization:', utilization.length);

    return {
      labels: utilization.map(u => u.DepartmentName || u.departmentName),
      datasets: [{
        label: 'Utilization %',
        data: utilization.map(u => u.UtilizationPercentage || u.utilizationPercentage || 0),
        backgroundColor: utilization.map(u => {
          const isHigh = u.IsHighUtilization ?? u.isHighUtilization ?? false;
          return isHigh ? '#dc3545' : '#28a745';
        }),
        borderColor: utilization.map(u => {
          const isHigh = u.IsHighUtilization ?? u.isHighUtilization ?? false;
          return isHigh ? '#dc3545' : '#28a745';
        }),
        borderWidth: 1
      }]
    };
  };

  const handleRefresh = () => {
    toast.info('Refreshing dashboard...');
    loadData();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>Management Dashboard</h2>
              <p className="text-muted">Strategic overview of organizational budget performance</p>
            </div>
            <Button variant="outline-secondary" onClick={handleRefresh}>
              <span className="me-1"></span>
              Refresh
            </Button>
          </div>
        </Col>
      </Row>

      {error && (
        <Row className="mb-4">
          <Col>
            <Alert variant="danger">
              <span className="me-2"></span>
              <strong>Error:</strong> {error}
            </Alert>
          </Col>
        </Row>
      )}

      {/* Enhanced Debug Info */}
      <Row className="mb-4">
        <Col>
          {/* <Alert variant="info">
            <strong>🐛 Enhanced Debug Info:</strong>
            <br />
            <strong>Dashboard loaded:</strong> {dashboard ? 'Yes' : 'No'} 
            <br />
            <strong>Dashboard keys:</strong> {dashboard ? Object.keys(dashboard).join(', ') : 'None'}
            <br />
            <strong>Summary exists:</strong> {dashboard?.Summary || dashboard?.summary ? 'Yes' : 'No'}
            <br />
            <strong>Departments count:</strong> {
              dashboard?.Summary?.Departments?.length || 
              dashboard?.summary?.departments?.length || 
              'None'
            }
            <br />
            <strong>UtilizationTrends count:</strong> {
              dashboard?.UtilizationTrends?.length || 
              dashboard?.utilizationTrends?.length || 
              'None'
            }
            <br />
            <strong>Performance items:</strong> {performance.length}
            
            {rawApiResponse && (
              <details className="mt-3">
                <summary style={{ cursor: 'pointer' }}>Show Raw API Response</summary>
                <pre className="mt-2 small" style={{ maxHeight: '400px', overflow: 'auto', backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '4px' }}>
                  {JSON.stringify(rawApiResponse, null, 2)}
                </pre>
              </details>
            )}
            
            {dashboard && (
              <details className="mt-3">
                <summary style={{ cursor: 'pointer' }}>Show Processed Dashboard Data</summary>
                <pre className="mt-2 small" style={{ maxHeight: '400px', overflow: 'auto', backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '4px' }}>
                  {JSON.stringify(dashboard, null, 2)}
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
                  <h6 className="text-muted">Total Budget</h6>
                  <h3 className="text-primary">
                    {formatCurrency(
                      dashboard?.Summary?.GrandTotalAllocation || 
                      dashboard?.summary?.grandTotalAllocation || 
                      0
                    )}
                  </h3>
                  <small className="text-muted">
                    Raw value: {dashboard?.Summary?.GrandTotalAllocation || dashboard?.summary?.grandTotalAllocation || 'Not found'}
                  </small>
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
                  <h6 className="text-muted">Total Utilized</h6>
                  <h3 className="text-success">
                    {formatCurrency(
                      dashboard?.Summary?.GrandTotalSpent || 
                      dashboard?.summary?.grandTotalSpent || 
                      0
                    )}
                  </h3>
                  <small className="text-muted">
                    Raw value: {dashboard?.Summary?.GrandTotalSpent || dashboard?.summary?.grandTotalSpent || 'Not found'}
                  </small>
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
                  <h6 className="text-muted">Departments</h6>
                  <h3 className="text-info">
                    {dashboard?.TotalDepartments || dashboard?.totalDepartments || 0}
                  </h3>
                  <small className="text-muted">
                    Raw value: {dashboard?.TotalDepartments || dashboard?.totalDepartments || 'Not found'}
                  </small>
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
                  <h6 className="text-muted">High Utilization</h6>
                  <h3 className="text-warning">
                    {dashboard?.HighUtilizationDepartments || dashboard?.highUtilizationDepartments || 0}
                  </h3>
                  <small className="text-muted">
                    Raw value: {dashboard?.HighUtilizationDepartments || dashboard?.highUtilizationDepartments || 'Not found'}
                  </small>
                </div>
                <div className="align-self-center">
                  <span className="fs-1"></span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Budget Distribution */}
        <Col lg={6} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">
                <span className="me-2"></span>
                Budget Distribution
              </h5>
            </Card.Header>
            <Card.Body>
              {(() => {
                const chartData = getBudgetDistributionData();
                console.log('Final chart data:', chartData);
                
                if (chartData) {
                  return (
                    <Pie 
                      data={chartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom'
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                const value = formatCurrency(context.parsed);
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${value} (${percentage}%)`;
                              }
                            }
                          }
                        }
                      }}
                      height={300}
                    />
                  );
                } else {
                  return (
                    <div className="text-center py-5">
                      <span className="fs-1"></span>
                      <h6 className="mt-3">No Chart Data</h6>
                      <p className="text-muted">
                        Budget distribution data not available
                        <br />
                        <small>Check console for detailed logs</small>
                      </p>
                      <Button variant="outline-primary" onClick={handleRefresh}>
                        Refresh Data
                      </Button>
                    </div>
                  );
                }
              })()}
            </Card.Body>
          </Card>
        </Col>

        {/* Department Utilization */}
        <Col lg={6} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5 className="mb-0">
                <span className="me-2"></span>
                Department Utilization
              </h5>
            </Card.Header>
            <Card.Body>
              {(() => {
                const chartData = getUtilizationData();
                console.log('Final utilization data:', chartData);
                
                if (chartData) {
                  return (
                    <Bar 
                      data={chartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                              callback: function(value) {
                                return value + '%';
                              }
                            }
                          }
                        },
                        plugins: {
                          legend: {
                            display: false
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                return `Utilization: ${context.parsed.y.toFixed(1)}%`;
                              }
                            }
                          }
                        }
                      }}
                      height={300}
                    />
                  );
                } else {
                  return (
                    <div className="text-center py-5">
                      <span className="fs-1"></span>
                      <h6 className="mt-3">No Chart Data</h6>
                      <p className="text-muted">
                        Utilization data not available
                        <br />
                        <small>Check console for detailed logs</small>
                      </p>
                      <Button variant="outline-primary" onClick={handleRefresh}>
                        Refresh Data
                      </Button>
                    </div>
                  );
                }
              })()}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Requests Summary */}
      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <span className="me-2"></span>
                Recent Requests ({dashboard?.PendingRequestsCount || dashboard?.pendingRequestsCount || 0} pending)
              </h5>
            </Card.Header>
            <Card.Body>
              {(() => {
                const recentRequests = dashboard?.RecentRequests || dashboard?.recentRequests || [];
                console.log('Recent requests:', recentRequests);
                
                if (recentRequests.length === 0) {
                  return (
                    <Alert variant="info" className="text-center">
                      <span className="fs-1"></span>
                      <h6 className="mt-3">No Recent Requests</h6>
                      <p className="text-muted">No recent requests to display</p>
                    </Alert>
                  );
                }

                return (
                  <div className="row">
                    {recentRequests.slice(0, 6).map(request => (
                      <div key={request.Id || request.id} className="col-md-4 col-lg-2 mb-3">
                        <div className="border rounded p-3 text-center">
                          <div className="fw-bold text-success mb-2">
                            {formatCurrency(request.Amount || request.amount)}
                          </div>
                          <div className="small text-muted mb-1">
                            {request.DepartmentName || request.departmentName}
                          </div>
                          <div className="small mb-2">
                            {request.CategoryName || request.categoryName}
                          </div>
                          <Badge 
                            bg={(request.Status ?? request.status) === 0 ? 'warning' : 
                                (request.Status ?? request.status) === 1 ? 'success' : 'danger'}
                          >
                            {(request.Status ?? request.status) === 0 ? 'Pending' : 
                             (request.Status ?? request.status) === 1 ? 'Approved' : 'Rejected'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ManagementDashboard;
