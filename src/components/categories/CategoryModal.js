import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { categoryService } from '../../services/categoryService';
import { toast } from 'react-toastify';

const CategoryModal = ({ show, onHide, category, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();

  const isEdit = !!category;

  useEffect(() => {
    if (show) {
      if (category) {
        // Edit mode - populate form
        setValue('name', category.name);
        setValue('limit', category.limit);
        setValue('timeframe', category.timeframe);
        setValue('thresholdPercent', category.thresholdPercent);
      } else {
        // Add mode - reset form
        reset({
          name: '',
          limit: 0,
          timeframe: 'Monthly',
          thresholdPercent: 80
        });
      }
      setError('');
    }
  }, [show, category, setValue, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      const categoryData = {
        ...data,
        limit: parseFloat(data.limit),
        thresholdPercent: parseInt(data.thresholdPercent)
      };

      if (isEdit) {
        categoryData.id = category.id;
        await categoryService.update(category.id, categoryData);
        toast.success('Category updated successfully');
      } else {
        await categoryService.create(categoryData);
        toast.success('Category created successfully');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving category:', error);
      setError(error.response?.data?.message || 'Failed to save category');
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
    <Modal show={show} onHide={handleClose} size="md">
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? 'Edit Category' : 'Add New Category'}</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label>Category Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter category name"
              {...register('name', {
                required: 'Category name is required',
                maxLength: {
                  value: 120,
                  message: 'Category name cannot exceed 120 characters'
                }
              })}
              isInvalid={errors.name}
            />
            <Form.Control.Feedback type="invalid">
              {errors.name?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Budget Limit</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              min="0"
              placeholder="Enter budget limit"
              {...register('limit', {
                required: 'Budget limit is required',
                min: {
                  value: 0,
                  message: 'Budget limit must be positive'
                }
              })}
              isInvalid={errors.limit}
            />
            <Form.Control.Feedback type="invalid">
              {errors.limit?.message}
            </Form.Control.Feedback>
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
              <option value="Yearly">Yearly</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.timeframe?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Threshold Percentage</Form.Label>
            <Form.Control
              type="number"
              min="0"
              max="100"
              placeholder="Enter threshold percentage"
              {...register('thresholdPercent', {
                required: 'Threshold percentage is required',
                min: {
                  value: 0,
                  message: 'Threshold must be at least 0%'
                },
                max: {
                  value: 100,
                  message: 'Threshold cannot exceed 100%'
                }
              })}
              isInvalid={errors.thresholdPercent}
            />
            <Form.Control.Feedback type="invalid">
              {errors.thresholdPercent?.message}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              Alert when spending reaches this percentage of the allocation
            </Form.Text>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update Category' : 'Create Category'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CategoryModal;
