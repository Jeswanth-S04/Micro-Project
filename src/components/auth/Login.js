import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [formData, setFormData] = useState({
    email: 'admin@corp.com', // Pre-fill for testing
    password: 'Admin@123'    // Pre-fill for testing
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // Test backend connection on component mount
  React.useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      const response = await fetch('http://localhost:5022/api/categories', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.status === 401 || response.status === 200) {
        // 401 or 200 means backend is running (401 is expected without auth)
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('error');
      }
    } catch (err) {
      console.error('Connection test failed:', err);
      setConnectionStatus('disconnected');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Login attempt with:', {
        email: formData.email,
        password: '***' // Don't log password
      });
      
      await login(formData.email, formData.password);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error details:', err);
      
      let errorMessage = 'Login failed. ';
      
      if (err.message) {
        errorMessage += err.message;
      } else if (err.response?.data?.message) {
        errorMessage += err.response.data.message;
      } else if (err.code === 'NETWORK_ERROR' || err.message.includes('Network Error')) {
        errorMessage += 'Cannot connect to server. Please check if the backend is running on http://localhost:5022';
      } else {
        errorMessage += 'Please check your credentials and try again.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getConnectionStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return <span className="badge bg-success">Connected</span>;
      case 'disconnected':
        return <span className="badge bg-danger">Disconnected</span>;
      case 'error':
        return <span className="badge bg-warning">Error</span>;
      default:
        return <span className="badge bg-info">Checking...</span>;
    }
  };

  return (
    <Container fluid className="min-vh-100 d-flex align-items-center bg-light">
      <Row className="justify-content-center w-100">
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card className="shadow-lg border-0 rounded-lg">
            <Card.Header className="text-center bg-primary text-white py-4">
              <div className="mb-3">
                <i className="bi bi-pie-chart fs-1"></i>
              </div>
              <h3 className="fw-light mb-0">Simple Budget Allocation Tool</h3>
              <p className="mb-0">Please sign in to your account</p>
            </Card.Header>
            
            <Card.Body className="p-4">
              {/* Connection Status */}
              <div className="mb-3 text-center">
                <small className="text-muted">
                  Backend Status: {getConnectionStatusBadge()}
                  <br />
                  <code>http://localhost:5022</code>
                </small>
              </div>

              {error && (
                <Alert variant="danger" className="mb-3">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </Alert>
              )}

              {connectionStatus === 'disconnected' && (
                <Alert variant="warning" className="mb-3">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  <strong>Backend Not Running!</strong><br />
                  Please start your .NET backend server:
                  <code className="d-block mt-1">dotnet run</code>
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="bi bi-envelope me-2"></i>
                    Email Address
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                    disabled={loading}
                    className="form-control-lg"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="bi bi-lock me-2"></i>
                    Password
                  </Form.Label>
                  <div className="input-group">
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      required
                      disabled={loading}
                      className="form-control-lg"
                    />
                    <Button
                      variant="outline-secondary"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                     👁
                    </Button>
                  </div>
                </Form.Group>

                <div className="d-grid mb-3">
                  <Button 
                    type="submit" 
                    variant="primary" 
                    size="lg"
                    disabled={loading || connectionStatus === 'disconnected'}
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          className="me-2"
                        />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        Sign In
                      </>
                    )}
                  </Button>
                </div>
              </Form>

              {/* Demo Credentials */}
              <div className="mt-4 pt-3 border-top">
                <h6 className="text-center mb-3">Demo Accounts:</h6>
                <div className="row g-2">
                  <div className="col-12">
                    <small className="text-muted">Finance Admin:</small><br />
                    <code>admin@corp.com / Admin@123</code>
                  </div>
                  <div className="col-12">
                    <small className="text-muted">Department Head:</small><br />
                    <code>eng@corp.com / Dept@123</code>
                  </div>
                  <div className="col-12">
                    <small className="text-muted">Management:</small><br />
                    <code>mgmt@corp.com / Mgmt@123</code>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
