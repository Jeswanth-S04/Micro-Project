import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Badge, Form, InputGroup, Modal, Alert } from 'react-bootstrap';
import { categoryService } from '../../services/categoryService';
import LoadingSpinner from '../common/LoadingSpinner';
import CategoryModal from './CategoryModal';
import { formatCurrency } from '../../utils/helpers';
import { useAuth } from '../../hooks/useAuth';
import { hasPermission, PERMISSIONS } from '../../utils/rolePermissions';
import { toast } from 'react-toastify';
import { TIMEFRAMES } from '../../utils/constants';

const CategoryList = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTimeframe, setFilterTimeframe] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Delete confirmation modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const canCreate = hasPermission(user?.role, PERMISSIONS.CREATE_CATEGORY);
  const canUpdate = hasPermission(user?.role, PERMISSIONS.UPDATE_CATEGORY);
  const canDelete = hasPermission(user?.role, PERMISSIONS.DELETE_CATEGORY);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    filterAndSortCategories();
  }, [categories, searchTerm, filterTimeframe, sortBy, sortOrder]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getAll();
      
      if (response.success || response.Success) {
        const categoryData = response.data || response.Data || [];
        setCategories(categoryData);
      } else {
        toast.error('Failed to load categories');
        setCategories([]);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Failed to load categories: ' + (error.message || 'Unknown error'));
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortCategories = () => {
    let filtered = [...categories];

    if (searchTerm) {
      filtered = filtered.filter(category =>
        category.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterTimeframe) {
      filtered = filtered.filter(category => category.timeframe === filterTimeframe);
    }

    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredCategories(filtered);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowModal(true);
  };

  const handleDelete = (category) => {
    console.log('🗑️ Delete initiated for category:', category);
    setDeletingCategory(category);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingCategory) {
      console.log('❌ No category to delete');
      return;
    }

    try {
      setDeleteLoading(true);
      console.log('🚀 Starting delete process for category ID:', deletingCategory.id);
      
      // Add detailed logging
      console.log('📋 Category details before deletion:', {
        id: deletingCategory.id,
        name: deletingCategory.name,
        limit: deletingCategory.limit,
        user: user,
        canDelete: canDelete
      });
      
      const response = await categoryService.delete(deletingCategory.id);
      console.log('✅ Delete API response:', response);
      
      if (response.success || response.Success) {
        // Remove from local state immediately
        setCategories(prevCategories => 
          prevCategories.filter(cat => cat.id !== deletingCategory.id)
        );
        
        setShowDeleteModal(false);
        setDeletingCategory(null);
        toast.success('Category deleted successfully');
        
        console.log('🎉 Category deleted successfully');
        
        // Optional: Refresh data after a short delay
        setTimeout(() => {
          loadCategories();
        }, 1000);
        
      } else {
        const errorMessage = response.message || response.Message || 'Failed to delete category';
        console.error('❌ Delete operation failed:', errorMessage);
        toast.error(`Delete failed: ${errorMessage}`);
      }
    } catch (error) {
      console.error('💥 Exception during delete:', error);
      
      // Enhanced error logging
      console.log('🔍 Error details:', {
        message: error.message,
        response: error.response,
        data: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      let errorMessage = 'Failed to delete category';
      
      if (error.response?.status === 404) {
        errorMessage = 'Category not found';
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to delete this category';
      } else if (error.response?.status === 400) {
        errorMessage = 'Cannot delete category - it may be in use by allocations';
      } else if (error.response?.data?.message || error.response?.data?.Message) {
        errorMessage = error.response.data.message || error.response.data.Message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(`Delete failed: ${errorMessage}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingCategory(null);
  };

  const handleModalSuccess = () => {
    handleModalClose();
    loadCategories();
  };

  const getThresholdBadge = (thresholdPercent) => {
    if (thresholdPercent >= 90) return <Badge bg="danger">{thresholdPercent}%</Badge>;
    if (thresholdPercent >= 70) return <Badge bg="warning">{thresholdPercent}%</Badge>;
    return <Badge bg="success">{thresholdPercent}%</Badge>;
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return <i className="bi bi-arrow-down-up text-muted"></i>;
    return sortOrder === 'asc' 
      ? <i className="bi bi-arrow-up text-primary"></i>
      : <i className="bi bi-arrow-down text-primary"></i>;
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>Budget Categories</h2>
              <p className="text-muted">
                Manage budget categories with limits and threshold alerts
              </p>
            </div>
            {canCreate && (
              <Button variant="primary" onClick={() => setShowModal(true)}>
                <i className="bi bi-plus me-1"></i>
                Add Category
              </Button>
            )}
          </div>
        </Col>
      </Row>

      {/* Debug Info - Remove this in production */}
      <Row className="mb-3">
        <Col>
          <Alert variant="info">
            <strong>🐛 Debug Info:</strong> 
            User Role: {user?.role} | 
            Can Delete: {canDelete ? 'Yes' : 'No'} | 
            Categories: {categories.length} |
            User ID: {user?.id}
          </Alert>
        </Col>
      </Row>

      {/* Filters and Search */}
      <Row className="mb-4">
        <Col md={4}>
          <InputGroup>
            <InputGroup.Text>
              <i className="bi bi-search"></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={3}>
          <Form.Select
            value={filterTimeframe}
            onChange={(e) => setFilterTimeframe(e.target.value)}
          >
            <option value="">All Timeframes</option>
            <option value="Monthly">Monthly</option>
            <option value="Quarterly">Quarterly</option>
            <option value="Yearly">Yearly</option>
          </Form.Select>
        </Col>
        <Col md={2}>
          <Form.Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">Sort by Name</option>
            <option value="limit">Sort by Limit</option>
            <option value="timeframe">Sort by Timeframe</option>
            <option value="thresholdPercent">Sort by Threshold</option>
          </Form.Select>
        </Col>
        <Col md={3} className="text-end">
          <Badge bg="info" className="me-2">
            {filteredCategories.length} of {categories.length} categories
          </Badge>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Body className="p-0">
              {filteredCategories.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-tags fs-1 text-muted"></i>
                  <h5 className="mt-3 text-muted">
                    {categories.length === 0 ? 'No categories found' : 'No categories match your filters'}
                  </h5>
                  <p className="text-muted">
                    {categories.length === 0 
                      ? 'Create your first budget category to get started'
                      : 'Try adjusting your search criteria'
                    }
                  </p>
                  {canCreate && categories.length === 0 && (
                    <Button variant="primary" onClick={() => setShowModal(true)}>
                      <i className="bi bi-plus me-1"></i>
                      Add First Category
                    </Button>
                  )}
                </div>
              ) : (
                <Table responsive hover className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th 
                        className="cursor-pointer" 
                        onClick={() => handleSort('name')}
                      >
                        Category Name {getSortIcon('name')}
                      </th>
                      <th 
                        className="cursor-pointer" 
                        onClick={() => handleSort('limit')}
                      >
                        Budget Limit {getSortIcon('limit')}
                      </th>
                      <th 
                        className="cursor-pointer" 
                        onClick={() => handleSort('timeframe')}
                      >
                        Timeframe {getSortIcon('timeframe')}
                      </th>
                      <th 
                        className="cursor-pointer" 
                        onClick={() => handleSort('thresholdPercent')}
                      >
                        Alert Threshold {getSortIcon('thresholdPercent')}
                      </th>
                      <th>Status</th>
                      {(canUpdate || canDelete) && <th className="text-center">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCategories.map((category) => (
                      <tr key={category.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <i className="bi bi-tag me-2 text-primary"></i>
                            <div>
                              <h6 className="mb-0">{category.name}</h6>
                              <small className="text-muted">ID: {category.id}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="fw-bold text-success">
                            {formatCurrency(category.limit)}
                          </span>
                        </td>
                        <td>
                          <Badge bg="secondary">{category.timeframe}</Badge>
                        </td>
                        <td>
                          {getThresholdBadge(category.thresholdPercent)}
                        </td>
                        <td>
                          <Badge bg="success">Active</Badge>
                        </td>
                        {(canUpdate || canDelete) && (
                          <td className="text-center">
                            <div className="btn-group btn-group-sm">
                              {canUpdate && (
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  onClick={() => handleEdit(category)}
                                  title="Edit Category"
                                >
                                  <i className="bi bi-pencil"></i>
                                </Button>
                              )}
                              {canDelete && (
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDelete(category)}
                                  title={`Delete Category: ${category.name}`}
                                >
                                  <i className="bi bi-trash"></i>
                                </Button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Category Modal */}
      <CategoryModal
        show={showModal}
        onHide={handleModalClose}
        onSuccess={handleModalSuccess}
        category={editingCategory}
      />

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Category Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deletingCategory && (
            <div>
              <Alert variant="danger">
                <strong>⚠️ Warning:</strong> This action cannot be undone!
              </Alert>
              
              <p>Are you sure you want to delete this category?</p>
              
              <div className="bg-light p-3 rounded">
                <strong>Category Details:</strong>
                <ul className="mb-0 mt-2">
                  <li><strong>ID:</strong> {deletingCategory.id}</li>
                  <li><strong>Name:</strong> {deletingCategory.name}</li>
                  <li><strong>Budget Limit:</strong> {formatCurrency(deletingCategory.limit)}</li>
                  <li><strong>Timeframe:</strong> {deletingCategory.timeframe}</li>
                  <li><strong>Threshold:</strong> {deletingCategory.thresholdPercent}%</li>
                </ul>
              </div>

              <Alert variant="warning" className="mt-3">
                <strong>📋 Note:</strong> This will also remove any budget allocations associated with this category.
              </Alert>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowDeleteModal(false)} 
            disabled={deleteLoading}
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={confirmDelete} 
            disabled={deleteLoading}
          >
            {deleteLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Deleting...
              </>
            ) : (
              'Delete Category'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CategoryList;
