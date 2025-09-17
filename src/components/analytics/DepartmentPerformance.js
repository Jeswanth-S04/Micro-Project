import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, ProgressBar, Badge } from 'react-bootstrap';
import { managementService } from '../../services/managementService';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatCurrency } from '../../utils/helpers';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { Radar, Bar } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const DepartmentPerformance = () => {
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPerformanceData();
  }, []);

  const loadPerformanceData = async () => {
    try {
      setLoading(true);
      const response = await managementService.getDepartmentPerformance();
      if (response.success) {
        setPerformanceData(response.data);
      }
    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceChart = () => {
    return {
      labels: performanceData.map(d => d.departmentName),
      datasets: [{
        label: 'Performance Score',
        data: performanceData.map(d => d.performanceScore),
        backgroundColor: performanceData.map(d => {
          if (d.performanceScore >= 80) return 'rgba(40, 167, 69, 0.6)';
          if (d.performanceScore >= 60) return 'rgba(255, 193, 7, 0.6)';
          return 'rgba(220, 53, 69, 0.6)';
        }),
        borderColor: performanceData.map(d => {
          if (d.performanceScore >= 80) return '#28a745';
          if (d.performanceScore >= 60) return '#ffc107';
          return '#dc3545';
        }),
        borderWidth: 2
      }]
    };
  };

  const getUtilizationChart = () => {
    return {
      labels: performanceData.map(d => d.departmentName),
      datasets: [{
        label: 'Utilization %',
        data: performanceData.map(d => d.utilizationPercentage),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: '#36a2eb',
        borderWidth: 2
      }]
    };
  };

  const getPerformanceBadge = (score) => {
    if (score >= 80) return <Badge bg="success">Excellent</Badge>;
    if (score >= 60) return <Badge bg="warning">Good</Badge>;
    if (score >= 40) return <Badge bg="info">Average</Badge>;
    return <Badge bg="danger">Needs Improvement</Badge>;
  };

  const getUtilizationBadge = (percentage) => {
    if (percentage > 100) return <Badge bg="danger">Over Budget</Badge>;
    if (percentage > 90) return <Badge bg="warning">High</Badge>;
    if (percentage > 70) return <Badge bg="success">Optimal</Badge>;
    if (percentage > 50) return <Badge bg="info">Moderate</Badge>;
    return <Badge bg="secondary">Low</Badge>;
  };

  const avgPerformanceScore = performanceData.length > 0 
    ? performanceData.reduce((sum, d) => sum + d.performanceScore, 0) / performanceData.length 
    : 0;

  const avgUtilization = performanceData.length > 0 
    ? performanceData.reduce((sum, d) => sum + d.utilizationPercentage, 0) / performanceData.length 
    : 0;

  const excellentPerformers = performanceData.filter(d => d.performanceScore >= 80);
  const needsImprovement = performanceData.filter(d => d.performanceScore < 60);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <Row className="mb-4">
        <Col>
          <h2>Department Performance Analysis</h2>
          <p className="text-muted">
            Comprehensive performance metrics and utilization analysis by department
          </p>
        </Col>
      </Row>

      {/* Summary Cards */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <Card className="h-100 border-primary">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="text-muted">Avg Performance</h6>
                  <h3 className="text-primary">{avgPerformanceScore.toFixed(1)}</h3>
                </div>
                <div className="align-self-center">
                  <i className="bi bi-trophy fs-1 text-primary"></i>
                </div>
              </div>
              <div className="mt-2">
                <ProgressBar 
                  now={avgPerformanceScore} 
                  variant={avgPerformanceScore >= 80 ? 'success' : avgPerformanceScore >= 60 ? 'warning' : 'danger'}
                  style={{ height: '6px' }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-3">
          <Card className="h-100 border-success">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="text-muted">Avg Utilization</h6>
                  <h3 className="text-success">{avgUtilization.toFixed(1)}%</h3>
                </div>
                <div className="align-self-center">
                  <i className="bi bi-graph-up fs-1 text-success"></i>
                </div>
              </div>
              <div className="mt-2">
                <ProgressBar 
                  now={Math.min(avgUtilization, 100)} 
                  variant={avgUtilization > 90 ? 'danger' : avgUtilization > 70 ? 'warning' : 'success'}
                  style={{ height: '6px' }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-3">
          <Card className="h-100 border-warning">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="text-muted">Top Performers</h6>
                  <h3 className="text-warning">{excellentPerformers.length}</h3>
                </div>
                <div className="align-self-center">
                  <i className="bi bi-star fs-1 text-warning"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} md={6} className="mb-3">
          <Card className="h-100 border-danger">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="text-muted">Needs Attention</h6>
                  <h3 className="text-danger">{needsImprovement.length}</h3>
                </div>
                <div className="align-self-center">
                  <i className="bi bi-exclamation-triangle fs-1 text-danger"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Performance Charts */}
      <Row className="mb-4">
        <Col lg={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Performance Scores</h5>
            </Card.Header>
            <Card.Body>
              <Bar 
                data={getPerformanceChart()}
                options={{
                  responsive: true,
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
                          return 'Score: ' + context.parsed.y.toFixed(1) + '%';
                        }
                      }
                    }
                  }
                }}
              />
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Budget Utilization</h5>
            </Card.Header>
            <Card.Body>
              <Bar 
                data={getUtilizationChart()}
                options={{
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true,
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
                          return 'Utilization: ' + context.parsed.y.toFixed(1) + '%';
                        }
                      }
                    }
                  }
                }}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Detailed Performance Table */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Detailed Performance Metrics</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Department</th>
                    <th>Total Allocation</th>
                    <th>Total Spent</th>
                    <th>Utilization</th>
                    <th>Categories</th>
                    <th>Near Limit</th>
                    <th>Exceeded</th>
                    <th>Performance Score</th>
                    <th>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {performanceData
                    .sort((a, b) => b.performanceScore - a.performanceScore)
                    .map((dept, index) => (
                    <tr key={dept.departmentId}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="me-2">
                            {index < 3 && (
                              <i className={`bi bi-trophy text-${index === 0 ? 'warning' : index === 1 ? 'secondary' : 'warning'}`}></i>
                            )}
                          </div>
                          <div>
                            <h6 className="mb-0">{dept.departmentName}</h6>
                            <small className="text-muted">Rank #{index + 1}</small>
                          </div>
                        </div>
                      </td>
                      <td>{formatCurrency(dept.totalAllocation)}</td>
                      <td>{formatCurrency(dept.totalSpent)}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="me-2" style={{ minWidth: '60px' }}>
                            <ProgressBar 
                              now={Math.min(dept.utilizationPercentage, 100)}
                              variant={
                                dept.utilizationPercentage > 90 ? 'danger' :
                                dept.utilizationPercentage > 70 ? 'warning' : 'success'
                              }
                              style={{ height: '8px' }}
                            />
                          </div>
                          <span className="small fw-bold">
                            {dept.utilizationPercentage.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-info">{dept.categoriesCount}</span>
                      </td>
                      <td>
                        {dept.categoriesNearingLimit > 0 && (
                          <Badge bg="warning">{dept.categoriesNearingLimit}</Badge>
                        )}
                      </td>
                      <td>
                        {dept.categoriesExceeded > 0 && (
                          <Badge bg="danger">{dept.categoriesExceeded}</Badge>
                        )}
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="me-2" style={{ minWidth: '40px' }}>
                            <ProgressBar 
                              now={dept.performanceScore}
                              variant={
                                dept.performanceScore >= 80 ? 'success' :
                                dept.performanceScore >= 60 ? 'warning' : 'danger'
                              }
                              style={{ height: '8px' }}
                            />
                          </div>
                          <span className="fw-bold">
                            {dept.performanceScore.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td>{getPerformanceBadge(dept.performanceScore)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DepartmentPerformance;
