import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { requestService } from '../../services/requestService';
import { categoryService } from '../../services/categoryService';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';

const RequestModal = ({ show, onHide, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    if (show) {
      loadCategories();
      reset({
        departmentId: user?.departmentId || 1,
        categoryId: '',
        reason: '',
        amount: 0
      });
      setError('');
    }
  }, [show, user, reset]);

  const loadCategories = async () => {
    try {
      const response = await categoryService.getAll();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      const requestData = {
        departmentId: parseInt(data.departmentId),
        categoryId: parseInt(data.categoryId),
        reason: data.reason,
        amount: parseFloat(data.amount)
      };

      await requestService.create(requestData);
      // toast.success('Request submitted successfully');
      onSuccess();
    } catch (error) {
      console.error('Error creating request:', error);
      setError(error.response?.data?.message || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setError('');
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>New Budget Adjustment Request</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label>Department</Form.Label>
            <Form.Select
              {...register('departmentId', {
                required: 'Department is required'
              })}
              isInvalid={errors.departmentId}
              disabled
            >
              <option value={1}>Engineering</option>
              <option value={2}>Marketing</option>
              <option value={3}>Sales</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.departmentId?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Select
              {...register('categoryId', {
                required: 'Category is required'
              })}
              isInvalid={errors.categoryId}
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name} - Limit: ${category.limit.toLocaleString()}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.categoryId?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Requested Amount</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              min="1"
              placeholder="Enter requested amount"
              {...register('amount', {
                required: 'Amount is required',
                min: {
                  value: 1,
                  message: 'Amount must be at least $1'
                }
              })}
              isInvalid={errors.amount}
            />
            <Form.Control.Feedback type="invalid">
              {errors.amount?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Reason for Request</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Provide a detailed explanation for this budget adjustment request..."
              {...register('reason', {
                required: 'Reason is required',
                minLength: {
                  value: 10,
                  message: 'Reason must be at least 10 characters'
                },
                maxLength: {
                  value: 500,
                  message: 'Reason cannot exceed 500 characters'
                }
              })}
              isInvalid={errors.reason}
            />
            <Form.Control.Feedback type="invalid">
              {errors.reason?.message}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              Provide clear justification for why this additional budget is needed
            </Form.Text>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default RequestModal;
