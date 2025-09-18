import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Badge, Modal, Form, Alert } from 'react-bootstrap';
import { userService } from '../../services/userService';
// import { departmentService } from '../../services/departmentService'; // Comment out if not exists
import LoadingSpinner from '../common/LoadingSpinner';
import { formatDate } from '../../utils/helpers';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';

const USER_ROLES = {
  1: { name: 'Finance Admin', color: 'danger' },
  2: { name: 'Department Head', color: 'primary' },
  3: { name: 'Management', color: 'success' }
};

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 2,
    departmentId: ''
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);

  // Check if user is Finance Admin (Role = 1)
  const isFinanceAdmin = user?.role === 1;

  useEffect(() => {
    if (isFinanceAdmin) {
      loadData();
    }
  }, [isFinanceAdmin]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Only load users for now, skip departments if service doesn't exist
      const usersResponse = await userService.getAll();

      if (usersResponse?.success || usersResponse?.Success) {
        setUsers(usersResponse.data || usersResponse.Data || []);
      }

      // TODO: Load departments when departmentService is available
      // const departmentsResponse = await departmentService.getAll();
      // if (departmentsResponse?.success || departmentsResponse?.Success) {
      //   setDepartments(departmentsResponse.data || departmentsResponse.Data || []);
      // }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 2,
      departmentId: ''
    });
    setShowModal(true);
  };

  const handleEdit = (userData) => {
    setEditingUser(userData);
    setFormData({
      name: userData.name,
      email: userData.email,
      password: '',
      role: userData.role,
      departmentId: userData.departmentId || ''
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      setSaveLoading(true);
      
      const submitData = {
        ...formData,
        departmentId: formData.departmentId ? parseInt(formData.departmentId) : null
      };

      let response;
      if (editingUser) {
        response = await userService.update(editingUser.id, { ...submitData, id: editingUser.id });
      } else {
        response = await userService.create(submitData);
      }

      if (response.success || response.Success) {
        toast.success(`User ${editingUser ? 'updated' : 'created'} successfully`);
        setShowModal(false);
        loadData();
      } else {
        toast.error(response.message || response.Message || `Failed to ${editingUser ? 'update' : 'create'} user`);
      }
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error(error.message || `Failed to ${editingUser ? 'update' : 'create'} user`);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = (userData) => {
    setDeletingUser(userData);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingUser) return;

    try {
      const response = await userService.delete(deletingUser.id);
      if (response.success || response.Success) {
        toast.success('User deleted successfully');
        setShowDeleteModal(false);
        setDeletingUser(null);
        loadData();
      } else {
        toast.error(response.message || response.Message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Failed to delete user');
    }
  };

  const getRoleBadge = (role) => {
    const roleInfo = USER_ROLES[role] || { name: 'Unknown', color: 'secondary' };
    return <Badge bg={roleInfo.color}>{roleInfo.name}</Badge>;
  };

  if (!isFinanceAdmin) {
    return (
      <Alert variant="danger">
        <h4>Access Denied</h4>
        <p>You don't have permission to access user management. Only Finance Admins can manage users.</p>
      </Alert>
    );
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>User Management</h2>
              <p className="text-muted">Create, edit, and manage system users</p>
            </div>
            <Button variant="primary" onClick={handleAdd}>
              Add New User
            </Button>
          </div>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">All Users ({users.length})</h5>
            </Card.Header>
            <Card.Body>
              {users.length === 0 ? (
                <Alert variant="info" className="text-center">
                  <h5>No Users Found</h5>
                  <p>Click "Add New User" to create the first user.</p>
                </Alert>
              ) : (
                <Table responsive hover>
                  <thead className="bg-light">
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Department</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((userData) => (
                      <tr key={userData.id}>
                        <td>{userData.id}</td>
                        <td>
                          <div className="fw-semibold">{userData.name}</div>
                        </td>
                        <td>{userData.email}</td>
                        <td>{getRoleBadge(userData.role)}</td>
                        <td>
                          {userData.departmentName || (
                            <span className="text-muted">No Department</span>
                          )}
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => handleEdit(userData)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleDelete(userData)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* User Form Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingUser ? 'Edit User' : 'Create New User'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email address"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Password {editingUser ? '(leave blank to keep current)' : '*'}</Form.Label>
                  <Form.Control
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingUser ? "Enter new password" : "Enter password"}
                    required={!editingUser}
                  />
                  {!editingUser && (
                    <Form.Text className="text-muted">
                      Minimum 6 characters required
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Role *</Form.Label>
                  <Form.Select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: parseInt(e.target.value) })}
                    required
                  >
                    <option value={1}>Finance Admin</option>
                    <option value={2}>Department Head</option>
                    <option value={3}>Management</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Department ID (Optional)</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    placeholder="Enter department ID"
                  />
                  <Form.Text className="text-muted">
                    Leave blank if no department assigned
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)} disabled={saveLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saveLoading}>
            {saveLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                {editingUser ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              editingUser ? 'Update User' : 'Create User'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deletingUser && (
            <div>
              <p>Are you sure you want to delete this user?</p>
              <Alert variant="warning">
                <strong>User:</strong> {deletingUser.name} ({deletingUser.email})
                <br />
                <strong>Role:</strong> {USER_ROLES[deletingUser.role]?.name}
                <br />
                <br />
                <strong>Warning:</strong> This action cannot be undone.
              </Alert>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete User
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserManagement;
