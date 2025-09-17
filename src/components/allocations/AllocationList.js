import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Form, Alert, Badge, ProgressBar, Modal } from 'react-bootstrap';
import { allocationService } from '../../services/allocationService';
import { categoryService } from '../../services/categoryService';
import { managementService } from '../../services/managementService';
import LoadingSpinner from '../common/LoadingSpinner';
import AllocationModal from './AllocationModal';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const AllocationList = () => {
  const { user } = useAuth();
  const [allocations, setAllocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(1);
  const [editingAllocation, setEditingAllocation] = useState(null);
  
  // Delete confirmation modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAllocation, setDeletingAllocation] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const isFinanceAdmin = user?.role === 1;

  console.log('AllocationList Debug:', {
    user,
    isFinanceAdmin,
    selectedDepartment,
    allocationsCount: allocations.length,
    editingAllocation,
    deletingAllocation
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedDepartment) {
      loadAllocations();
    }
  }, [selectedDepartment]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      console.log('Loading initial data...');

      const results = await Promise.allSettled([
        categoryService.getAll(),
        managementService.getDashboard()
      ]);

      // Handle categories
      if (results[0].status === 'fulfilled') {
        if (results[0].value?.success && Array.isArray(results[0].value.data)) {
          console.log('Categories loaded:', results[0].value.data);
          setCategories(results[0].value.data);
        } else if (results[0].value?.Success && Array.isArray(results[0].value.Data)) {
          console.log('Categories loaded (uppercase):', results[0].value.Data);
          setCategories(results[0].value.Data);
        }
      }

      // Handle departments from management dashboard
      if (results[1].status === 'fulfilled') {
        if (results[1].value?.success) {
          const managementData = results[1].value.data;
          const deptList = managementData?.Summary?.Departments || managementData?.summary?.departments || [];
          const mappedDepts = deptList.map(d => ({
            id: d.DepartmentId || d.departmentId,
            name: d.DepartmentName || d.departmentName
          }));
          console.log('Departments loaded:', mappedDepts);
          setDepartments(mappedDepts);
        } else if (results[1].value?.Success) {
          const managementData = results[1].value.Data;
          const deptList = managementData?.Summary?.Departments || [];
          const mappedDepts = deptList.map(d => ({
            id: d.DepartmentId,
            name: d.DepartmentName
          }));
          console.log('Departments loaded (uppercase):', mappedDepts);
          setDepartments(mappedDepts);
        }
      }

      // Set default department if none selected
      if (departments.length > 0 && !selectedDepartment) {
        setSelectedDepartment(departments[0].id);
      }

    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Failed to load initial data');
    } finally {
      loadAllocations();
    }
  };

  const loadAllocations = async () => {
    if (!selectedDepartment) return;

    try {
      setLoading(true);
      console.log(`Loading allocations for department ${selectedDepartment}...`);

      const response = await allocationService.getByDepartment(selectedDepartment);
      console.log('Allocations response:', response);

      if (response?.success && Array.isArray(response.data)) {
        console.log('Setting allocations:', response.data);
        setAllocations(response.data);
      } else if (response?.Success && Array.isArray(response.Data)) {
        const mappedAllocations = response.Data.map(alloc => ({
          id: alloc.Id,
          departmentId: alloc.DepartmentId,
          categoryId: alloc.CategoryId,
          amount: alloc.Amount || 0,
          spent: alloc.Spent || 0,
          timeframe: alloc.Timeframe || 'Monthly',
          createdAt: alloc.CreatedAt,
          departmentName: alloc.DepartmentName,
          categoryName: alloc.CategoryName
        }));
        console.log('Setting allocations (mapped):', mappedAllocations);
        setAllocations(mappedAllocations);
      } else {
        console.log('Invalid allocations response:', response);
        setAllocations([]);
      }
    } catch (error) {
      console.error('Error loading allocations:', error);
      setAllocations([]);
      toast.error('Failed to load allocations');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingAllocation(null);
    setShowModal(true);
  };

  const handleEditAllocation = (allocation) => {
    console.log('Editing allocation:', allocation);
    setEditingAllocation(allocation);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingAllocation(null);
  };

  const handleModalSuccess = (message = 'Allocation saved successfully') => {
    setShowModal(false);
    setEditingAllocation(null);
    loadAllocations(); // Reload to get updated data
    toast.success(message);
  };

  // Delete functionality
  const handleDeleteAllocation = (allocation) => {
    setDeletingAllocation(allocation);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingAllocation) return;

    try {
      setDeleteLoading(true);
      console.log('Deleting allocation:', deletingAllocation.id);
      
      const response = await allocationService.delete(deletingAllocation.id);
      
      if (response.success || response.Success) {
        // Remove from local state immediately
        setAllocations(allocations.filter(alloc => alloc.id !== deletingAllocation.id));
        
        setShowDeleteModal(false);
        setDeletingAllocation(null);
        toast.success('Allocation deleted successfully');
        
        // Refresh data to ensure consistency
        setTimeout(() => {
          loadAllocations();
        }, 500);
      } else {
        toast.error('Failed to delete allocation');
      }
    } catch (error) {
      console.error('Error deleting allocation:', error);
      toast.error('Failed to delete allocation: ' + (error.message || 'Unknown error'));
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleUpdateSpent = async (allocationId, newSpent) => {
    if (newSpent < 0) {
      toast.error('Spent amount cannot be negative');
      return;
    }

    const allocation = allocations.find(a => a.id === allocationId);
    if (allocation && newSpent > allocation.amount) {
      const confirm = window.confirm(`Spent amount (${formatCurrency(newSpent)}) exceeds allocated amount (${formatCurrency(allocation.amount)}). Continue?`);
      if (!confirm) return;
    }

    try {
      console.log(`Updating spent amount for allocation ${allocationId} to ${newSpent}`);
      await allocationService.updateSpent(allocationId, newSpent);
      toast.success('Spent amount updated successfully');
      loadAllocations();
    } catch (error) {
      console.error('Error updating spent amount:', error);
      toast.error('Failed to update spent amount');
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => (c.id || c.Id) === categoryId);
    return category ? (category.name || category.Name) : 'Unknown Category';
  };

  const getDepartmentName = (departmentId) => {
    const department = departments.find(d => d.id === departmentId);
    return department ? department.name : `Department ${departmentId}`;
  };

  const getUtilizationVariant = (percentage) => {
    if (percentage >= 100) return 'danger';
    if (percentage >= 80) return 'warning';
    if (percentage >= 60) return 'info';
    return 'success';
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>Budget Allocations</h2>
              <p className="text-muted">Manage department budget allocations and track spending</p>
            </div>
            {isFinanceAdmin && (
              <Button 
                variant="primary"
                onClick={handleCreateNew}
              >
                Add Allocation
              </Button>
            )}
          </div>
        </Col>
      </Row>

      {/* Department Filter */}
      <Row className="mb-3">
        <Col md={4}>
          <Form.Group>
            <Form.Label>Department</Form.Label>
            <Form.Select 
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(parseInt(e.target.value))}
            >
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
              {/* Fallback options if departments not loaded */}
              {departments.length === 0 && (
                <>
                  <option value={1}>Engineering</option>
                  <option value={2}>Marketing</option>
                  <option value={3}>Sales</option>
                </>
              )}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={8} className="d-flex align-items-end">
          <Button variant="outline-secondary" onClick={loadAllocations}>
            Refresh
          </Button>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                Allocations for {getDepartmentName(selectedDepartment)}
              </h5>
            </Card.Header>
            <Card.Body>
              {!selectedDepartment ? (
                <div className="text-center py-5">
                  <h5 className="mt-3 text-muted">Select a Department</h5>
                  <p className="text-muted">Choose a department to view its budget allocations</p>
                </div>
              ) : allocations.length === 0 ? (
                <div className="text-center py-5">
                  <h5 className="mt-3 text-muted">No allocations found</h5>
                  <p className="text-muted">
                    {isFinanceAdmin 
                      ? 'Create the first budget allocation for this department' 
                      : 'No budget has been allocated to this department yet'}
                  </p>
                  {isFinanceAdmin && (
                    <Button variant="primary" onClick={handleCreateNew}>
                      Add Allocation
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  {/* Summary Cards */}
                  <Row className="mb-4">
                    <Col md={3}>
                      <Card className="bg-primary text-white">
                        <Card.Body className="text-center">
                          <h3>{allocations.length}</h3>
                          <small>Categories</small>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={3}>
                      <Card className="bg-success text-white">
                        <Card.Body className="text-center">
                          <h3>{formatCurrency(allocations.reduce((sum, a) => sum + (a.amount || 0), 0))}</h3>
                          <small>Total Allocated</small>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={3}>
                      <Card className="bg-info text-white">
                        <Card.Body className="text-center">
                          <h3>{formatCurrency(allocations.reduce((sum, a) => sum + (a.spent || 0), 0))}</h3>
                          <small>Total Spent</small>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={3}>
                      <Card className="bg-warning text-white">
                        <Card.Body className="text-center">
                          <h3>{formatCurrency(allocations.reduce((sum, a) => sum + ((a.amount || 0) - (a.spent || 0)), 0))}</h3>
                          <small>Remaining</small>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  {/* Allocations Table */}
                  <Table responsive hover>
                    <thead className="bg-light">
                      <tr>
                        <th>Category</th>
                        <th>Allocated</th>
                        <th>Spent</th>
                        <th>Remaining</th>
                        <th>Utilization</th>
                        <th>Timeframe</th>
                        <th>Created</th>
                        {isFinanceAdmin && <th>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {allocations.map((allocation) => {
                        const amount = allocation.amount || 0;
                        const spent = allocation.spent || 0;
                        const utilizationPercent = amount > 0 ? (spent / amount) * 100 : 0;
                        const remaining = amount - spent;
                        
                        return (
                          <tr key={allocation.id}>
                            <td>
                              <div className="fw-semibold">
                                {allocation.categoryName || getCategoryName(allocation.categoryId)}
                              </div>
                            </td>
                            <td className="fw-bold text-primary">
                              {formatCurrency(amount)}
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <span className="me-2 fw-bold text-success">
                                  {formatCurrency(spent)}
                                </span>
                                {isFinanceAdmin && (
                                  <Button
                                    size="sm"
                                    variant="outline-secondary"
                                    style={{ border: "none", padding: "2px 6px" }}
                                    onClick={() => {
                                      const newSpent = prompt('Enter new spent amount:', spent);
                                      if (newSpent !== null && !isNaN(newSpent)) {
                                        handleUpdateSpent(allocation.id, parseFloat(newSpent));
                                      }
                                    }}
                                    title="Update spent amount"
                                  >
                                    ✏️
                                  </Button>
                                )}
                              </div>
                            </td>
                            <td>
                              <span className={`fw-bold ${remaining < 0 ? 'text-danger' : 'text-success'}`}>
                                {formatCurrency(remaining)}
                              </span>
                            </td>
                            <td>
                              <div style={{ minWidth: '120px' }}>
                                <div className="d-flex align-items-center mb-1">
                                  <span className={`me-2 ${utilizationPercent > 100 ? 'text-danger' : 'text-success'}`}>
                                    {utilizationPercent.toFixed(1)}%
                                  </span>
                                </div>
                                <ProgressBar 
                                  now={Math.min(utilizationPercent, 100)} 
                                  variant={getUtilizationVariant(utilizationPercent)}
                                  style={{ height: '6px' }}
                                />
                              </div>
                            </td>
                            <td>
                              <Badge bg="info">{allocation.timeframe || 'Monthly'}</Badge>
                            </td>
                            <td>{formatDate(allocation.createdAt)}</td>
                            {isFinanceAdmin && (
                              <td>
                                <div className="d-flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline-primary"
                                    onClick={() => handleEditAllocation(allocation)}
                                    title="Edit Allocation"
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline-danger"
                                    onClick={() => handleDeleteAllocation(allocation)}
                                    title="Delete Allocation"
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Allocation Modal */}
      <AllocationModal
        show={showModal}
        onHide={handleModalClose}
        onSuccess={handleModalSuccess}
        allocation={editingAllocation}
        departmentId={selectedDepartment}
        categories={categories}
        isEditing={!!editingAllocation}
      />

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deletingAllocation && (
            <div>
              <Alert variant="warning">
                <strong>⚠️ Warning:</strong> This action cannot be undone!
              </Alert>
              
              <p>Are you sure you want to delete this allocation?</p>
              
              <div className="bg-light p-3 rounded">
                <strong>Allocation Details:</strong>
                <ul className="mb-0 mt-2">
                  <li><strong>Category:</strong> {deletingAllocation.categoryName}</li>
                  <li><strong>Department:</strong> {getDepartmentName(deletingAllocation.departmentId)}</li>
                  <li><strong>Allocated Amount:</strong> {formatCurrency(deletingAllocation.amount)}</li>
                  <li><strong>Spent Amount:</strong> {formatCurrency(deletingAllocation.spent)}</li>
                  <li><strong>Remaining:</strong> {formatCurrency(deletingAllocation.amount - deletingAllocation.spent)}</li>
                </ul>
              </div>

              {deletingAllocation.spent > 0 && (
                <Alert variant="danger" className="mt-3">
                  <strong>⚠️ Important:</strong> This allocation has recorded expenses of {formatCurrency(deletingAllocation.spent)}. 
                  Deleting this allocation will remove all spending records for this category.
                </Alert>
              )}
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
              'Delete Allocation'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AllocationList;
