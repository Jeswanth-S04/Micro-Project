import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Badge, Form, Alert, Modal } from 'react-bootstrap';
import { userService } from '../../services/userService';
import LoadingSpinner from '../common/LoadingSpinner';
import UserModal from './UserModal';
import { formatDate } from '../../utils/helpers';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

// Constants
const USER_ROLES = {
  1: 'Finance Admin',
  2: 'Department Head',
  3: 'Management'
};

const ROLE_VARIANTS = {
  1: 'danger',    // Finance Admin - Red
  2: 'primary',   // Department Head - Blue  
  3: 'success'    // Management - Green
};

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [filterRole, setFilterRole] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const isFinanceAdmin = currentUser?.role === 1;

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      const [usersResponse, departmentsResponse] = await Promise.allSettled([
        userService.getAll(),
        userService.getDepartments()
      ]);

      // Handle users
      if (usersResponse.status === 'fulfilled' && usersResponse.value?.Success) {
        setUsers(usersResponse.value.Data || []);
      } else {
        setUsers([]);
        toast.error('Failed to load users');
      }

      // Handle departments
      if (departmentsResponse.status === 'fulfilled' && departmentsResponse.value?.Success) {
        setDepartments(departmentsResponse.value.Data || []);
      } else {
        setDepartments([]);
      }

    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load user management data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setShowUserModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowUserModal(true);
  };

  const handleUserModalClose = () => {
    setShowUserModal(false);
    setEditingUser(null);
  };

  const handleUserModalSuccess = () => {
    setShowUserModal(false);
    setEditingUser(null);
    loadInitialData(); // Reload users
    toast.success(editingUser ? 'User updated successfully' : 'User created successfully');
  };

  const handleDeleteUser = (user) => {
    setDeletingUser(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!deletingUser) return;

    try {
      setDeleteLoading(true);
      
      const response = await userService.delete(deletingUser.Id);
      
      if (response.Success) {
        setUsers(users.filter(u => u.Id !== deletingUser.Id));
        setShowDeleteModal(false);
        setDeletingUser(null);
        toast.success('User deleted successfully');
      } else {
        toast.error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user: ' + (error.message || 'Unknown error'));
    } finally {
      setDeleteLoading(false);
    }
  };

  const getDepartmentName = (departmentId) => {
    const dept = departments.find(d => d.Id === departmentId);
    return dept ? dept.Name : 'N/A';
  };

  const getRoleBadge = (roleId) => {
    return (
      <Badge bg={ROLE_VARIANTS[roleId] || 'secondary'}>
        {USER_ROLES[roleId] || 'Unknown'}
      </Badge>
    );
  };

  const getStatusBadge = (isActive) => {
    return (
      <Badge bg={isActive ? 'success' : 'danger'}>
        {isActive ? 'Active' : 'Inactive'}
      </Badge>
    );
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.Email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.Role?.toString() === filterRole;
    
    const matchesDepartment = filterDepartment === 'all' || 
      user.DepartmentId?.toString() === filterDepartment;
    
    return matchesSearch && matchesRole && matchesDepartment;
  });

  const userStats = {
    total: users.length,
    active: users.filter(u => u.IsActive).length,
    inactive: users.filter(u => !u.IsActive).length,
    financeAdmins: users.filter(u => u.Role === 1).length,
    departmentHeads: users.filter(u => u.Role === 2).length,
    management: users.filter(u => u.Role === 3).length
  };

  if (loading) return <LoadingSpinner />;

  if (!isFinanceAdmin) {
    return (
      <Alert variant="danger">
        <h5>Access Denied</h5>
        <p>You don't have permission to manage users. This feature is only available to Finance Admins.</p>
      </Alert>
    );
  }

  return (
    <div>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>User Management</h2>
              <p className="text-muted">
                Manage system users, roles, and permissions
              </p>
            </div>
            <Button variant="primary" onClick={handleCreateUser}>
              Add New User
            </Button>
          </div>
        </Col>
      </Row>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={2}>
          <Card className="bg-primary text-white">
            <Card.Body className="text-center">
              <h3>{userStats.total}</h3>
              <small>Total Users</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="bg-success text-white">
            <Card.Body className="text-center">
              <h3>{userStats.active}</h3>
              <small>Active</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="bg-danger text-white">
            <Card.Body className="text-center">
              <h3>{userStats.inactive}</h3>
              <small>Inactive</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="bg-info text-white">
            <Card.Body className="text-center">
              <h3>{userStats.financeAdmins}</h3>
              <small>Finance Admins</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="bg-warning text-white">
            <Card.Body className="text-center">
              <h3>{userStats.departmentHeads}</h3>
              <small>Dept Heads</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={2}>
          <Card className="bg-secondary text-white">
            <Card.Body className="text-center">
              <h3>{userStats.management}</h3>
              <small>Management</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Row className="mb-3">
        <Col md={3}>
          <Form.Group>
            <Form.Label>Search Users</Form.Label>
            <Form.Control
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Filter by Role</Form.Label>
            <Form.Select 
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="1">Finance Admin</option>
              <option value="2">Department Head</option>
              <option value="3">Management</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Filter by Department</Form.Label>
            <Form.Select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept.Id} value={dept.Id}>
                  {dept.Name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3} className="d-flex align-items-end">
          <Button 
            variant="outline-secondary" 
            onClick={() => {
              setSearchTerm('');
              setFilterRole('all');
              setFilterDepartment('all');
            }}
          >
            Clear Filters
          </Button>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                Users ({filteredUsers.length} of {users.length})
              </h5>
            </Card.Header>
            <Card.Body>
              {filteredUsers.length === 0 ? (
                <div className="text-center py-5">
                  <h5 className="mt-3 text-muted">No users found</h5>
                  <p className="text-muted">
                    {users.length === 0 
                      ? 'No users have been created yet' 
                      : 'No users match the current filters'}
                  </p>
                  {users.length === 0 && (
                    <Button variant="primary" onClick={handleCreateUser}>
                      Create First User
                    </Button>
                  )}
                </div>
              ) : (
                <Table responsive hover>
                  <thead className="bg-light">
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Department</th>
                      <th>Status</th>
                      <th>Last Login</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.Id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div>
                              <div className="fw-semibold">{user.Name}</div>
                              {user.Id === currentUser?.id && (
                                <small className="text-primary">(You)</small>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>{user.Email}</td>
                        <td>{getRoleBadge(user.Role)}</td>
                        <td>
                          <small className="text-muted">
                            {getDepartmentName(user.DepartmentId)}
                          </small>
                        </td>
                        <td>{getStatusBadge(user.IsActive)}</td>
                        <td>
                          <small className="text-muted">
                            {user.LastLoginAt 
                              ? formatDate(user.LastLoginAt)
                              : 'Never'
                            }
                          </small>
                        </td>
                        <td>
                          <small className="text-muted">
                            {formatDate(user.CreatedAt)}
                          </small>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => handleEditUser(user)}
                            >
                              Edit
                            </Button>
                            {user.Id !== currentUser?.id && (
                              <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() => handleDeleteUser(user)}
                              >
                                Delete
                              </Button>
                            )}
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

      {/* User Modal */}
      <UserModal
        show={showUserModal}
        onHide={handleUserModalClose}
        onSuccess={handleUserModalSuccess}
        user={editingUser}
        departments={departments}
        isEditing={!!editingUser}
      />

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm User Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deletingUser && (
            <div>
              <Alert variant="danger">
                <strong>Warning:</strong> This action cannot be undone!
              </Alert>
              
              <p>Are you sure you want to delete this user?</p>
              
              <div className="bg-light p-3 rounded">
                <strong>User Details:</strong>
                <ul className="mb-0 mt-2">
                  <li><strong>Name:</strong> {deletingUser.Name}</li>
                  <li><strong>Email:</strong> {deletingUser.Email}</li>
                  <li><strong>Role:</strong> {USER_ROLES[deletingUser.Role]}</li>
                  <li><strong>Department:</strong> {getDepartmentName(deletingUser.DepartmentId)}</li>
                </ul>
              </div>

              {deletingUser.Id === currentUser?.id && (
                <Alert variant="warning" className="mt-3">
                  <strong>Note:</strong> You cannot delete your own account.
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
            onClick={confirmDeleteUser} 
            disabled={deleteLoading || deletingUser?.Id === currentUser?.id}
          >
            {deleteLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Deleting...
              </>
            ) : (
              'Delete User'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserManagement;
