import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { allocationService } from '../../services/allocationService';
import { categoryService } from '../../services/categoryService';
import { toast } from 'react-toastify';

const AllocationModal = ({ 
  show, 
  onHide, 
  onSuccess, 
  allocation = null, 
  departmentId = null, 
  categories = [], 
  isEditing = false 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [localCategories, setLocalCategories] = useState([]);
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm();

  const isEditMode = isEditing && allocation;

  console.log('AllocationModal Debug:', {
    show,
    isEditMode,
    allocation,
    departmentId,
    categoriesLength: categories.length || localCategories.length
  });

  useEffect(() => {
    if (show) {
      loadCategories();
      setError('');
      
      if (isEditMode && allocation) {
        // Pre-populate form for editing
        reset({
          departmentId: allocation.departmentId || departmentId || 1,
          categoryId: allocation.categoryId || '',
          amount: allocation.amount || 0,
          timeframe: allocation.timeframe || 'Monthly'
        });
      } else {
        // Reset form for creating new
        reset({
          departmentId: departmentId || 1,
          categoryId: '',
          amount: 0,
          timeframe: 'Monthly'
        });
      }
    }
  }, [show, reset, isEditMode, allocation, departmentId]);

  const loadCategories = async () => {
    // Use passed categories if available, otherwise load them
    if (categories && categories.length > 0) {
      setLocalCategories(categories);
      return;
    }

    try {
      const response = await categoryService.getAll();
      if (response?.success && Array.isArray(response.data)) {
        setLocalCategories(response.data);
      } else if (response?.Success && Array.isArray(response.Data)) {
        setLocalCategories(response.Data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      const allocationData = {
        ...data,
        departmentId: parseInt(data.departmentId),
        categoryId: parseInt(data.categoryId),
        amount: parseFloat(data.amount),
        timeframe: data.timeframe || 'Monthly'
      };

      if (isEditMode && allocation) {
        // Update existing allocation
        console.log('Updating allocation:', allocation.id, allocationData);
        await allocationService.update(allocation.id, allocationData);
        toast.success('Allocation updated successfully');
        onSuccess('Allocation updated successfully');
      } else {
        // Create new allocation
        console.log('Creating allocation:', allocationData);
        await allocationService.create(allocationData);
        // toast.success('Allocation created successfully');
        onSuccess('Allocation created successfully');
      }
    } catch (error) {
      console.error('Error saving allocation:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.Message || 
                          error.message || 
                          `Insufficient Fund `;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setError('');
    onHide();
  };

  const displayCategories = categories.length > 0 ? categories : localCategories;

  return (
    <Modal show={show} onHide={handleClose} size="md">
      <Modal.Header closeButton>
        <Modal.Title>
          {isEditMode ? 'Edit Allocation' : 'Add New Allocation'}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          {isEditMode && allocation && (
            <Alert variant="info">
              <strong>Editing:</strong> {allocation.categoryName} for {allocation.departmentName}
            </Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Department</Form.Label>
            <Form.Select
              {...register('departmentId', {
                required: 'Department is required'
              })}
              isInvalid={errors.departmentId}
              disabled={isEditMode} // Don't allow changing department when editing
            >
              <option value="">Select Department</option>
              <option value={1}>Engineering</option>
              <option value={2}>Marketing</option>
              <option value={3}>Sales</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.departmentId?.message}
            </Form.Control.Feedback>
            {isEditMode && (
              <Form.Text className="text-muted">
                Department cannot be changed when editing
              </Form.Text>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Select
              {...register('categoryId', {
                required: 'Category is required'
              })}
              isInvalid={errors.categoryId}
              disabled={isEditMode} // Don't allow changing category when editing
            >
              <option value="">Select Category</option>
              {displayCategories.map((category) => (
                <option key={category.id || category.Id} value={category.id || category.Id}>
                  {category.name || category.Name} - Limit: {(category.limit || category.Limit || 0).toLocaleString()}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.categoryId?.message}
            </Form.Control.Feedback>
            {isEditMode && (
              <Form.Text className="text-muted">
                Category cannot be changed when editing
              </Form.Text>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Allocation Amount</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              min="0"
              max="1000000"
              placeholder="Enter allocation amount"
              {...register('amount', {
                required: 'Allocation amount is required',
                min: {
                  value: 0.01,
                  message: 'Amount must be greater than 0'
                },max:{
                    value:1000000,
                    message: 'Enter valid Amount(Limit Exceeded)'
                }

              })}
              isInvalid={errors.amount}
            />
            <Form.Control.Feedback type="invalid">
              {errors.amount?.message}
            </Form.Control.Feedback>
            {isEditMode && allocation && (
              <Form.Text className="text-muted">
                Current spent: {(allocation.spent || 0).toLocaleString()} | 
                Remaining: {((allocation.amount || 0) - (allocation.spent || 0)).toLocaleString()}
              </Form.Text>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Timeframe</Form.Label>
            <Form.Select
              {...register('timeframe', {
                required: 'Timeframe is required'
              })}
              isInvalid={errors.timeframe}
            >
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Annual">Annual</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.timeframe?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              isEditMode ? 'Update Allocation' : 'Create Allocation'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AllocationModal;
