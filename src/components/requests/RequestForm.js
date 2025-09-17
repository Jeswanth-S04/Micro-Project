import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { requestService } from '../../services/requestService';
import { categoryService } from '../../services/categoryService';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency } from '../../utils/helpers';
import { toast } from 'react-toastify';

const RequestForm = ({ show, onHide, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [departments] = useState([
    { id: 1, name: 'Engineering' },
    { id: 2, name: 'Marketing' },
    { id: 3, name: 'Sales' },
    { id: 4, name: 'HR' },
    { id: 5, name: 'Finance' }
  ]);

  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    reset, 
    watch,
    setValue 
  } = useForm();

  const watchedCategory = watch('categoryId');

  useEffect(() => {
    if (show) {
      loadCategories();
      reset({
        departmentId: user?.departmentId || '',
        categoryId: '',
        reason: '',
        amount: ''
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
      toast.error('Failed to load categories');
    }
  };

  const getSelectedCategory = () => {
    return categories.find(c => c.id === parseInt(watchedCategory));
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      const requestData = {
        departmentId: parseInt(data.departmentId),
        categoryId: parseInt(data.categoryId),
        reason: data.reason.trim(),
        amount: parseFloat(data.amount)
      };

      const response = await requestService.create(requestData);
      
      if (response.success) {
        toast.success('Budget adjustment request submitted successfully');
        onSuccess?.(response.data);
      } else {
        setError(response.message || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Error creating request:', error);
      setError(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setError('');
    onHide();
  };

  const getDepartmentName = (departmentId) => {
    const dept = departments.find(d => d.id === departmentId);
    return dept ? dept.name : 'Unknown Department';
  };

  const selectedCategory = getSelectedCategory();

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          
          New Budget Adjustment Request
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          {error && (
            <Alert variant="danger" className="mb-3">
              
              {error}
            </Alert>
          )}

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <i className="bi bi-building me-1"></i>
                  Department <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  {...register('departmentId', {
                    required: 'Department is required'
                  })}
                  isInvalid={errors.departmentId}
                  disabled={!!user?.departmentId}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.departmentId?.message}
                </Form.Control.Feedback>
                {user?.departmentId && (
                  <Form.Text className="text-muted">
                    You can only submit requests for your assigned department: {getDepartmentName(user.departmentId)}
                  </Form.Text>
                )}
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                 
                  Budget Category <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  {...register('categoryId', {
                    required: 'Budget category is required'
                  })}
                  isInvalid={errors.categoryId}
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name} - {formatCurrency(category.limit)} ({category.timeframe})
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.categoryId?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {selectedCategory && (
            <Alert variant="info" className="mb-3">
              <Row>
                <Col md={4}>
                  <strong>Category Limit:</strong><br />
                  {formatCurrency(selectedCategory.limit)}
                </Col>
                <Col md={4}>
                  <strong>Timeframe:</strong><br />
                  {selectedCategory.timeframe}
                </Col>
                <Col md={4}>
                  <strong>Alert Threshold:</strong><br />
                  {selectedCategory.thresholdPercent}%
                </Col>
              </Row>
            </Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Label>
              <i className="bi bi-currency-dollar me-1"></i>
              Requested Amount <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              min="1"
              placeholder="Enter the amount you're requesting"
              {...register('amount', {
                required: 'Amount is required',
                min: {
                  value: 1,
                  message: 'Amount must be at least $1'
                },
                max: {
                  value: 1000000,
                  message: 'Amount cannot exceed $1,000,000'
                }
              })}
              isInvalid={errors.amount}
            />
            <Form.Control.Feedback type="invalid">
              {errors.amount?.message}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              Enter the additional budget amount you need for this category
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              <i className="bi bi-journal-text me-1"></i>
              Justification <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Provide a detailed explanation for why you need this additional budget..."
              {...register('reason', {
                required: 'Justification is required',
                minLength: {
                  value: 20,
                  message: 'Justification must be at least 20 characters'
                },
                maxLength: {
                  value: 500,
                  message: 'Justification cannot exceed 500 characters'
                }
              })}
              isInvalid={errors.reason}
            />
            <Form.Control.Feedback type="invalid">
              {errors.reason?.message}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              Explain the business need, urgency, and expected outcomes. This will help reviewers make an informed decision.
            </Form.Text>
          </Form.Group>

          <Alert variant="warning">
            <i className="bi bi-info-circle me-2"></i>
            <strong>Important:</strong> Once submitted, this request will be reviewed by the Finance Admin team. 
            You will receive notifications about the status of your request via email and in-app notifications.
          </Alert>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            <i className="bi bi-x-circle me-1"></i>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Submitting...
              </>
            ) : (
              <>
                <i className="bi bi-send me-1"></i>
                Submit Request
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default RequestForm;
