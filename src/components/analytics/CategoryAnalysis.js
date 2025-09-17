import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, ProgressBar, Form } from 'react-bootstrap';
import { managementService } from '../../services/managementService';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatCurrency } from '../../utils/helpers';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { CHART_COLORS } from '../../utils/constants';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CategoryAnalysis = () => {
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('totalAllocated');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    loadCategoryAnalysis();
  }, []);

  const loadCategoryAnalysis = async () => {
    try {
      setLoading(true);
      const response = await managementService.getCategoryAnalysis();
      if (response.success) {
        setCategoryData(response.data);
      }
    } catch (error) {
      console.error('Error loading category analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSortedData = () => {
    return [...categoryData].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });
  };

  const getUtilizationChart = () => {
    const sortedData = getSortedData().slice(0, 10);
    
    return {
      labels: sortedData.map(c => c.categoryName),
      datasets: [{
        label: 'Utilization %',
        data: sortedData.map(c => c.utilizationPercentage),
        backgroundColor: sortedData.map(c => {
          if (c.utilizationPercentage > 90) return '#dc3545';
          if (c.utilizationPercentage > 70) return '#ffc107';
          return '#28a745';
        }),
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    };
  };

  const getAllocationChart = () => {
    const sortedData = getSortedData().slice(0, 8);
    
    return {
      labels: sortedData.map(c => c.categoryName),
      datasets: [
        {
          label: 'Allocated',
          data: sortedData.map(c => c.totalAllocated),
          backgroundColor: '#007bff',
          borderColor: '#0056b3',
          borderWidth: 1
        },
        {
          label: 'Spent',
          data: sortedData.map(c => c.totalSpent),
          backgroundColor: '#28a745',
          borderColor: '#1e7e34',
          borderWidth: 1
        }
      ]
    };
  };

  const getStatusBadge = (category) => {
    if (category.utilizationPercentage > 100) {
      return <span className="badge bg-danger">Over Budget</span>;
    } else if (category.utilizationPercentage > 90) {
      return <span className="badge bg-warning">High Usage</span>;
    } else if (category.utilizationPercentage > 50) {
      return <span className="badge bg-success">Normal</span>;
    } else {
      return <span className="badge bg-info">Low Usage</span>;
    }
  };

  const sortedData = getSortedData();
  const totalAllocated = categoryData.reduce((sum, c) => sum + c.totalAllocated, 0);
  const totalSpent = categoryData.reduce((sum, c) => sum + c.totalSpent, 0);
  const overBudgetCategories = categoryData.filter(c => c.utilizationPercentage > 100);
  const highUsageCategories = categoryData.filter(c => c.utilizationPercentage > 90 && c.utilizationPercentage <= 100);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <Row className="mb-4">
        <Col>
          <h2>Category Analysis</h2>
          <p className="text-muted">Detailed analysis of budget category performance and utilization</p>
        </Col>
      </Row>

      {/* Summary Cards */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <Card className="h-100 border-primary">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="text-muted">Total Categories</h6>
                  <h3 className="text-primary">{categoryData.length}</h3>
                </div>
                <div className="align-self-center">
                  <i className="bi bi-tags fs-1 text-primary"></i>
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
                  <h6 className="text-muted">Total Allocated</h6>
                  <h3 className="text-success">{formatCurrency(totalAllocated)}</h3>
                </div>
                <div className="align-self-center">
                  <i className="bi bi-wallet2 fs-1 text-success"></i>
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
                  <h6 className="text-muted">Over Budget</h6>
                  <h3 className="text-warning">{overBudgetCategories.length}</h3>
                </div>
                <div className="align-self-center">
                  <i className="bi bi-exclamation-triangle fs-1 text-warning"></i>
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
                  <h6 className="text-muted">High Usage</h6>
                  <h3 className="text-info">{highUsageCategories.length}</h3>
                </div>
                <div className="align-self-center">
                  <i className="bi bi-graph-up fs-1 text-info"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row className="mb-4">
        <Col lg={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Category Utilization</h5>
            </Card.Header>
            <Card.Body>
              <Bar 
                data={getUtilizationChart()}
                options={{
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 120,
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
                          return 'Utilization: ' + context.parsed.y + '%';
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
              <h5 className="mb-0">Allocated vs Spent</h5>
            </Card.Header>
            <Card.Body>
              <Bar 
                data={getAllocationChart()}
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
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Detailed Table */}
      <Row>
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Detailed Category Analysis</h5>
              <div className="d-flex gap-2">
                <Form.Select
                  size="sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{ width: 'auto' }}
                >
                  <option value="totalAllocated">Sort by Allocated</option>
                  <option value="totalSpent">Sort by Spent</option>
                  <option value="utilizationPercentage">Sort by Utilization</option>
                  <option value="departmentCount">Sort by Departments</option>
                  <option value="remainingLimit">Sort by Remaining</option>
                </Form.Select>
                <Form.Select
                  size="sm"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  style={{ width: 'auto' }}
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </Form.Select>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Category</th>
                    <th>Limit</th>
                    <th>Allocated</th>
                    <th>Spent</th>
                    <th>Utilization</th>
                    <th>Departments</th>
                    <th>Remaining Limit</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map((category) => (
                    <tr key={category.categoryId}>
                      <td>
                        <div className="d-flex align-items-center">
                          <i className="bi bi-tag me-2 text-primary"></i>
                          <h6 className="mb-0">{category.categoryName}</h6>
                        </div>
                      </td>
                      <td>{formatCurrency(category.categoryLimit)}</td>
                      <td>{formatCurrency(category.totalAllocated)}</td>
                      <td>{formatCurrency(category.totalSpent)}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="me-2" style={{ minWidth: '60px' }}>
                            <ProgressBar 
                              now={Math.min(category.utilizationPercentage, 100)}
                              variant={
                                category.utilizationPercentage > 90 ? 'danger' :
                                category.utilizationPercentage > 70 ? 'warning' : 'success'
                              }
                              style={{ height: '8px' }}
                            />
                          </div>
                          <span className="small fw-bold">
                            {category.utilizationPercentage.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-info">{category.departmentCount}</span>
                      </td>
                      <td>
                        <span className={category.remainingLimit < 0 ? 'text-danger fw-bold' : 'text-success'}>
                          {formatCurrency(category.remainingLimit)}
                        </span>
                      </td>
                      <td>{getStatusBadge(category)}</td>
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

export default CategoryAnalysis;
