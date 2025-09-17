import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Badge, Form } from 'react-bootstrap';
import { managementService } from '../../services/managementService';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatCurrency } from '../../utils/helpers';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { REQUEST_STATUS_LABELS } from '../../utils/constants';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const RequestAnalysis = () => {
  const [requestData, setRequestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    loadRequestAnalysis();
  }, [timeRange]);

  const loadRequestAnalysis = async () => {
    try {
      setLoading(true);
      const response = await managementService.getRequestAnalytics(timeRange);
      if (response.success) {
        setRequestData(response.data);
      }
    } catch (error) {
      console.error('Error loading request analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusDistributionChart = () => {
    if (!requestData) return null;

    return {
      labels: ['Approved', 'Rejected', 'Pending'],
      datasets: [{
        data: [
          requestData.approvedRequests,
          requestData.rejectedRequests,
          requestData.pendingRequests
        ],
        backgroundColor: ['#28a745', '#dc3545', '#ffc107'],
        borderColor: ['#1e7e34', '#b21f2d', '#e0a800'],
        borderWidth: 2
      }]
    };
  };

  const getDepartmentRequestChart = () => {
    if (!requestData?.topRequestingDepartments) return null;

    return {
      labels: requestData.topRequestingDepartments.map(d => d.departmentName),
      datasets: [{
        label: 'Request Count',
        data: requestData.topRequestingDepartments.map(d => d.requestCount),
        backgroundColor: '#007bff',
        borderColor: '#0056b3',
        borderWidth: 1
      }]
    };
  };

  const getAmountRequestedChart = () => {
    if (!requestData?.topRequestingDepartments) return null;

    return {
      labels: requestData.topRequestingDepartments.map(d => d.departmentName),
      datasets: [{
        label: 'Amount Requested',
        data: requestData.topRequestingDepartments.map(d => d.totalAmountRequested),
        backgroundColor: '#28a745',
        borderColor: '#1e7e34',
        borderWidth: 1
      }]
    };
  };

  const getApprovalRateBadge = (rate) => {
    if (rate >= 80) return <Badge bg="success">{rate}%</Badge>;
    if (rate >= 60) return <Badge bg="warning">{rate}%</Badge>;
    return <Badge bg="danger">{rate}%</Badge>;
  };

  if (loading) return <LoadingSpinner />;

  if (!requestData) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-file-earmark-text fs-1 text-muted"></i>
        <h5 className="mt-3 text-muted">No request data available</h5>
        <p className="text-muted">Try selecting a different time range</p>
      </div>
    );
  }

  return (
    <div>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>Request Analysis</h2>
              <p className="text-muted">
                Comprehensive analysis of budget adjustment requests and approval patterns
              </p>
            </div>
            <Form.Group style={{ minWidth: '200px' }}>
              <Form.Label>Time Range</Form.Label>
              <Form.Select 
                value={timeRange}
                onChange={(e) => setTimeRange(parseInt(e.target.value))}
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
                <option value={180}>Last 6 months</option>
                <option value={365}>Last year</option>
              </Form.Select>
            </Form.Group>
          </div>
        </Col>
      </Row>

      {/* Summary Cards */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <Card className="h-100 border-primary">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="text-muted">Total Requests</h6>
                  <h3 className="text-primary">{requestData.totalRequests}</h3>
                </div>
                <div className="align-self-center">
                  <i className="bi bi-file-earmark-text fs-1 text-primary"></i>
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
                  <h6 className="text-muted">Approval Rate</h6>
                  <h3 className="text-success">{requestData.approvalRate}%</h3>
                </div>
                <div className="align-self-center">
                  <i className="bi bi-check-circle fs-1 text-success"></i>
                </div>
              </div>
              <div className="mt-2">
                <div className="progress" style={{ height: '6px' }}>
                  <div 
                    className={`progress-bar ${requestData.approvalRate >= 70 ? 'bg-success' : requestData.approvalRate >= 50 ? 'bg-warning' : 'bg-danger'}`}
                    style={{ width: `${requestData.approvalRate}%` }}
                  ></div>
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
                  <h6 className="text-muted">Total Requested</h6>
                  <h3 className="text-info">{formatCurrency(requestData.totalAmountRequested)}</h3>
                </div>
                <div className="align-self-center">
                  <i className="bi bi-cash-stack fs-1 text-info"></i>
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
                  <h6 className="text-muted">Avg Request</h6>
                  <h3 className="text-warning">{formatCurrency(requestData.averageRequestAmount)}</h3>
                </div>
                <div className="align-self-center">
                  <i className="bi bi-calculator fs-1 text-warning"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row className="mb-4">
        <Col lg={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Request Status Distribution</h5>
            </Card.Header>
            <Card.Body>
              <Doughnut 
                data={getStatusDistributionChart()}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const total = context.dataset.data.reduce((a, b) => a + b, 0);
                          const percentage = ((context.parsed / total) * 100).toFixed(1);
                          return `${context.label}: ${context.parsed} (${percentage}%)`;
                        }
                      }
                    }
                  }
                }}
              />
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Requests by Department</h5>
            </Card.Header>
            <Card.Body>
              {getDepartmentRequestChart() ? (
                <Bar 
                  data={getDepartmentRequestChart()}
                  options={{
                    responsive: true,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        display: false
                      }
                    }
                  }}
                />
              ) : (
                <div className="text-center text-muted py-4">
                  No department data available
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Amount Requested by Department</h5>
            </Card.Header>
            <Card.Body>
              {getAmountRequestedChart() ? (
                <Bar 
                  data={getAmountRequestedChart()}
                  options={{
                    responsive: true,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value) {
                            return formatCurrency(value);
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
                            return 'Amount: ' + formatCurrency(context.parsed.y);
                          }
                        }
                      }
                    }
                  }}
                />
              ) : (
                <div className="text-center text-muted py-4">
                  No amount data available
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Detailed Department Analysis */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Department Request Analysis</h5>
            </Card.Header>
            <Card.Body>
              {requestData.topRequestingDepartments.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">No department request data available for the selected time range</p>
                </div>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Department</th>
                      <th>Total Requests</th>
                      <th>Amount Requested</th>
                      <th>Approved</th>
                      <th>Approval Rate</th>
                      <th>Avg Request Size</th>
                      <th>Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requestData.topRequestingDepartments.map((dept) => {
                      const approvalRate = dept.requestCount > 0 
                        ? ((dept.approvedCount / dept.requestCount) * 100).toFixed(1)
                        : 0;
                      const avgRequestSize = dept.requestCount > 0 
                        ? dept.totalAmountRequested / dept.requestCount
                        : 0;

                      return (
                        <tr key={dept.departmentId}>
                          <td>
                            <h6 className="mb-0">{dept.departmentName}</h6>
                          </td>
                          <td>
                            <Badge bg="primary">{dept.requestCount}</Badge>
                          </td>
                          <td>{formatCurrency(dept.totalAmountRequested)}</td>
                          <td>
                            <Badge bg="success">{dept.approvedCount}</Badge>
                          </td>
                          <td>
                            {getApprovalRateBadge(parseFloat(approvalRate))}
                          </td>
                          <td>{formatCurrency(avgRequestSize)}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="me-2" style={{ minWidth: '60px' }}>
                                <div className="progress" style={{ height: '8px' }}>
                                  <div 
                                    className={`progress-bar ${approvalRate >= 70 ? 'bg-success' : approvalRate >= 50 ? 'bg-warning' : 'bg-danger'}`}
                                    style={{ width: `${approvalRate}%` }}
                                  ></div>
                                </div>
                              </div>
                              <span className="small">
                                {approvalRate >= 70 ? 'Excellent' : 
                                 approvalRate >= 50 ? 'Good' : 'Needs Improvement'}
                              </span>
                            </div>
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
      </Row>

      {/* Summary Statistics */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Summary Statistics</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3} className="text-center">
                  <h4 className="text-success">{formatCurrency(requestData.totalAmountApproved)}</h4>
                  <small className="text-muted">Total Approved Amount</small>
                </Col>
                <Col md={3} className="text-center">
                  <h4 className="text-primary">{requestData.approvedRequests}</h4>
                  <small className="text-muted">Approved Requests</small>
                </Col>
                <Col md={3} className="text-center">
                  <h4 className="text-danger">{requestData.rejectedRequests}</h4>
                  <small className="text-muted">Rejected Requests</small>
                </Col>
                <Col md={3} className="text-center">
                  <h4 className="text-warning">{requestData.pendingRequests}</h4>
                  <small className="text-muted">Pending Requests</small>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default RequestAnalysis;
