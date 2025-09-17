import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { userService } from '../../services/userService';
import { toast } from 'react-toastify';

const UserModal = ({ 
  show, 
  onHide, 
  onSuccess, 
  user = null, 
  departments = [], 
  isEditing = false 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    reset, 
    watch 
  } = useForm();

  const watchedRole = watch('role');

  useEffect(() => {
    if (show) {
      if (isEditing && user) {
        // Pre-populate form for editing
        reset({
          name: user.Name || '',
          email: user.Email || '',
          role: user.Role || 2,
          departmentId: user.DepartmentId || '',
          isActive: user.IsActive ?? true,
          password: '', // Don't pre-fill password
          confirmPassword: ''
        });
      } else {
        // Reset form for creating new user
        reset({
          name: '',
          email: '',
          role: 2, // Default to Department Head
          departmentId: '',
          isActive: true,
          password: '',
          confirmPassword: ''
        });
      }
      setError('');
    }
  }, [show, isEditing, user, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      // Validate passwords for new users or when password is provided
      if (!isEditing || data.password) {
        if (data.password !== data.confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        if (data.password.length < 6) {
          setError('Password must be at least 6 characters long');
          return;
        }
      }

      const userData = {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        role: parseInt(data.role),
        departmentId: data.departmentId ? parseInt(data.departmentId) : null,
        isActive: data.isActive
      };

      // Add password only if provided (for new users or password changes)
      if (!isEditing || data.password) {
        userData.password = data.password;
      }

      let response;
      if (isEditing) {
        response = await userService.update(user.Id, userData);
      } else {
        response = await userService.create(userData);
      }

      if (response.Success) {
        onSuccess();
      } else {
        setError(response.Message || 'Failed to save user');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      setError(error.response?.data?.Message || error.message || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setError('');
    onHide();
  };

  const roleRequiresDepartment = (roleId) => {
    return parseInt(roleId) === 2; // Department Head requires department
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {isEditing ? 'Edit User' : 'Add New User'}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          {isEditing && user && (
            <Alert variant="info">
              <strong>Editing:</strong> {user.Name} ({user.Email})
            </Alert>
          )}

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Full Name *</Form.Label>
                <Form.Control
                  type="text"
                  {...register('name', {
                    required: 'Full name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters'
                    },
                    maxLength: {
                      value: 100,
                      message: 'Name cannot exceed 100 characters'
                    }
                  })}
                  isInvalid={errors.name}
                  placeholder="Enter full name"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email Address *</Form.Label>
                <Form.Control
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Please enter a valid email address'
                    }
                  })}
                  isInvalid={errors.email}
                  placeholder="Enter email address"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Role *</Form.Label>
                <Form.Select
                  {...register('role', {
                    required: 'Role is required'
                  })}
                  isInvalid={errors.role}
                >
                  <option value="">Select Role</option>
                  <option value="1">Finance Admin</option>
                  <option value="2">Department Head</option>
                  <option value="3">Management</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.role?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Department {roleRequiresDepartment(watchedRole) && '*'}
                </Form.Label>
                <Form.Select
                  {...register('departmentId', {
                    required: roleRequiresDepartment(watchedRole) 
                      ? 'Department is required for Department Head role' 
                      : false
                  })}
                  isInvalid={errors.departmentId}
                  disabled={!roleRequiresDepartment(watchedRole)}
                >
                  <option value="">
                    {roleRequiresDepartment(watchedRole) 
                      ? 'Select Department' 
                      : 'N/A (Not required for this role)'}
                  </option>
                  {departments.map(dept => (
                    <option key={dept.Id} value={dept.Id}>
                      {dept.Name}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.departmentId?.message}
                </Form.Control.Feedback>
                {!roleRequiresDepartment(watchedRole) && (
                  <Form.Text className="text-muted">
                    Department is only required for Department Head role
                  </Form.Text>
                )}
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Password {!isEditing && '*'}
                </Form.Label>
                <Form.Control
                  type="password"
                  {...register('password', {
                    required: !isEditing ? 'Password is required' : false,
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  isInvalid={errors.password}
                  placeholder={isEditing ? 'Leave blank to keep current password' : 'Enter password'}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.password?.message}
                </Form.Control.Feedback>
                {isEditing && (
                  <Form.Text className="text-muted">
                    Leave blank to keep current password
                  </Form.Text>
                )}
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Confirm Password {!isEditing && '*'}
                </Form.Label>
                <Form.Control
                  type="password"
                  {...register('confirmPassword', {
                    required: !isEditing ? 'Please confirm password' : false
                  })}
                  isInvalid={errors.confirmPassword}
                  placeholder={isEditing ? 'Confirm new password if changing' : 'Confirm password'}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.confirmPassword?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  {...register('isActive')}
                  label="Active User"
                />
                <Form.Text className="text-muted">
                  Inactive users cannot log in to the system
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              isEditing ? 'Update User' : 'Create User'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default UserModal;
