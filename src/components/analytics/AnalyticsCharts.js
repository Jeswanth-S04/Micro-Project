import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form } from 'react-bootstrap';
import { managementService } from '../../services/managementService';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatCurrency } from '../../utils/helpers';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import { CHART_COLORS } from '../../utils/constants';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsCharts = () => {
  const [analytics, setAnalytics] = useState(null);
  const [trends, setTrends] = useState([]);
  const [categoryAnalysis, setCategoryAnalysis] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(90);

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, trendsRes, categoryRes, performanceRes] = await Promise.all([
        managementService.getRequestAnalytics(timeRange),
        managementService.getAllocationTrends(6),
        managementService.getCategoryAnalysis(),
        managementService.getDepartmentPerformance()
      ]);

      if (analyticsRes.success) setAnalytics(analyticsRes.data);
      if (trendsRes.success) setTrends(trendsRes.data);
      if (categoryRes.success) setCategoryAnalysis(categoryRes.data);
      if (performanceRes.success) setPerformance(performanceRes.data);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRequestStatusChart = () => {
    if (!analytics) return null;

    return {
      labels: ['Approved', 'Rejected', 'Pending'],
      datasets: [{
        data: [analytics.approvedRequests, analytics.rejectedRequests, analytics.pendingRequests],
        backgroundColor: ['#28a745', '#dc3545', '#ffc107'],
        borderColor: ['#1e7e34', '#b21f2d', '#e0a800'],
        borderWidth: 2
      }]
    };
  };

  const getDepartmentPerformanceChart = () => {
    if (!performance || performance.length === 0) return null;

    return {
      labels: performance.map(p => p.departmentName),
      datasets: [{
        label: 'Performance Score',
        data: performance.map(p => p.performanceScore),
        backgroundColor: performance.map(p => {
          if (p.performanceScore >= 80) return '#28a745';
          if (p.performanceScore >= 60) return '#ffc107';
          return '#dc3545';
        }),
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    };
  };

  const getAllocationTrendsChart = () => {
    if (!trends || trends.length === 0) return null;

    const groupedByMonth = trends.reduce((acc, trend) => {
      const key = `${trend.year}-${trend.month.toString().padStart(2, '0')}`;
      if (!acc[key]) {
        acc[key] = { allocated: 0, spent: 0 };
      }
      acc[key].allocated += trend.totalAllocated;
      acc[key].spent += trend.totalSpent;
      return acc;
    }, {});

    const sortedKeys = Object.keys(groupedByMonth).sort();

    return {
      labels: sortedKeys.map(key => {
        const [year, month] = key.split('-');
        return new Date(year, month - 1).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        });
      }),
      datasets: [
        {
          label: 'Allocated',
          data: sortedKeys.map(key => groupedByMonth[key].allocated),
          borderColor: '#007bff',
          backgroundColor: 'rgba(0, 123, 255, 0.1)',
          tension: 0.4
        },
        {
          label: 'Spent',
          data: sortedKeys.map(key => groupedByMonth[key].spent),
          borderColor: '#28a745',
          backgroundColor: 'rgba(40, 167, 69, 0.1)',
          tension: 0.4
        }
      ]
    };
  };

  const getCategoryUtilizationChart = () => {
    if (!categoryAnalysis || categoryAnalysis.length === 0) return null;

    return {
      labels: categoryAnalysis.slice(0, 8).map(c => c.categoryName),
      datasets: [{
        label: 'Utilization %',
        data: categoryAnalysis.slice(0, 8).map(c => c.utilizationPercentage),
        backgroundColor: categoryAnalysis.slice(0, 8).map(c => 
          c.utilizationPercentage > 90 ? '#dc3545' : 
          c.utilizationPercentage > 70 ? '#ffc107' : '#28a745'
        ),
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    };
  };

  const getTopDepartmentsChart = () => {
    if (!analytics?.topRequestingDepartments) return null;

    return {
      labels: analytics.topRequestingDepartments.map(d => d.departmentName),
      datasets: [{
        data: analytics.topRequestingDepartments.map(d => d.totalAmountRequested),
        backgroundColor: CHART_COLORS.slice(0, analytics.topRequestingDepartments.length),
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    };
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>Analytics Dashboard</h2>
              <p className="text-muted">Visual insights into budget management performance</p>
            </div>
            <Form.Group style={{ minWidth: '200px' }}>
              <Form.Label>Time Range</Form.Label>
              <Form.Select 
                value={timeRange}
                onChange={(e) => setTimeRange(parseInt(e.target.value))}
              >
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
                <option value={180}>Last 6 months</option>
                <option value={365}>Last year</option>
              </Form.Select>
            </Form.Group>
          </div>
        </Col>
      </Row>

      {/* Request Analytics */}
      {analytics && (
        <Row className="mb-4">
          <Col lg={4}>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Request Status Distribution</h5>
              </Card.Header>
              <Card.Body>
                <Doughnut 
                  data={getRequestStatusChart()}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'bottom'
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
                <h5 className="mb-0">Top Requesting Departments</h5>
              </Card.Header>
              <Card.Body>
                {getTopDepartmentsChart() ? (
                  <Pie 
                    data={getTopDepartmentsChart()}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'bottom'
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
                <h5 className="mb-0">Request Metrics</h5>
              </Card.Header>
              <Card.Body>
                <div className="row text-center">
                  <div className="col-6 mb-3">
                    <h4 className="text-primary">{analytics.totalRequests}</h4>
                    <small className="text-muted">Total Requests</small>
                  </div>
                  <div className="col-6 mb-3">
                    <h4 className="text-success">{analytics.approvalRate}%</h4>
                    <small className="text-muted">Approval Rate</small>
                  </div>
                  <div className="col-12 mb-3">
                    <h4 className="text-info">{formatCurrency(analytics.averageRequestAmount)}</h4>
                    <small className="text-muted">Average Request</small>
                  </div>
                  <div className="col-12">
                    <h4 className="text-warning">{formatCurrency(analytics.totalAmountApproved)}</h4>
                    <small className="text-muted">Total Approved</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Performance and Trends */}
      <Row className="mb-4">
        <Col lg={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Department Performance Scores</h5>
            </Card.Header>
            <Card.Body>
              {getDepartmentPerformanceChart() ? (
                <Bar 
                  data={getDepartmentPerformanceChart()}
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
                      }
                    }
                  }}
                />
              ) : (
                <div className="text-center text-muted py-4">
                  No performance data available
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Category Utilization</h5>
            </Card.Header>
            <Card.Body>
              {getCategoryUtilizationChart() ? (
                <Bar 
                  data={getCategoryUtilizationChart()}
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
                      }
                    }
                  }}
                />
              ) : (
                <div className="text-center text-muted py-4">
                  No category data available
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Allocation Trends */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Budget Allocation Trends (Last 6 Months)</h5>
            </Card.Header>
            <Card.Body>
              {getAllocationTrendsChart() ? (
                <Line 
                  data={getAllocationTrendsChart()}
                  options={{
                    responsive: true,
                    interaction: {
                      mode: 'index',
                      intersect: false,
                    },
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
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return context.dataset.label + ': ' + formatCurrency(context.parsed.y);
                          }
                        }
                      }
                    }
                  }}
                />
              ) : (
                <div className="text-center text-muted py-4">
                  No trend data available
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AnalyticsCharts;
