import React, { useState } from 'react';
import { Modal, Form, Button, Alert, Badge } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { requestService } from '../../services/requestService';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { toast } from 'react-toastify';

const ReviewModal = ({ show, onHide, request, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  React.useEffect(() => {
    if (show && request) {
      reset({
        approve: 'true',  // Set default to approve
        reviewerNote: ''
      });
      setError('');
    }
  }, [show, request, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      // Handle both uppercase and lowercase property names
      const requestId = request.id || request.Id;
      
      if (!requestId) {
        throw new Error('Request ID not found');
      }

      console.log('🔍 Reviewing request:', {
        originalRequest: request,
        requestId: requestId,
        approve: data.approve,
        reviewerNote: data.reviewerNote
      });

      const reviewData = {
        requestId: parseInt(requestId), // Ensure it's a number
        approve: data.approve === 'true' || data.approve === true,
        reviewerNote: data.reviewerNote?.trim() || null
      };

      console.log('📝 Sending review data:', reviewData);

      const response = await requestService.review(reviewData);
      console.log('✅ Review response:', response);

      toast.success(reviewData.approve ? 'Request approved successfully' : 'Request rejected successfully');
      onSuccess();
    } catch (error) {
      console.error('❌ Error reviewing request:', error);
      
      let errorMessage = 'Failed to review request';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.Message) {
        errorMessage = error.response.data.Message;
      } else if (error.response?.data?.Errors?.Message) {
        errorMessage = error.response.data.Errors.Message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
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

  if (!request) return null;

  // Handle both uppercase and lowercase properties
  const requestId = request.id || request.Id;
  const amount = request.amount || request.Amount || 0;
  const departmentId = request.departmentId || request.DepartmentId;
  const departmentName = request.departmentName || request.DepartmentName || `Department ${departmentId}`;
  const categoryId = request.categoryId || request.CategoryId;
  const categoryName = request.categoryName || request.CategoryName || `Category ${categoryId}`;
  const reason = request.reason || request.Reason || 'No reason provided';
  const createdAt = request.createdAt || request.CreatedAt;
  const status = request.status ?? request.Status ?? 0;

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <span className="me-2"></span>
          Review Budget Request
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          {error && (
            <Alert variant="danger">
              <span className="me-2"></span>
              {error}
            </Alert>
          )}

          {/* Debug Info */}
          <Alert variant="info" className="mb-4">
            <strong>Debug Info:</strong> Request ID: {requestId} | 
            Type: {typeof requestId} | 
            Status: {status}
            <details className="mt-2">
              <summary style={{ cursor: 'pointer' }}>Show Full Request Object</summary>
              <pre className="mt-2 small" style={{ maxHeight: '200px', overflow: 'auto' }}>
                {JSON.stringify(request, null, 2)}
              </pre>
            </details>
          </Alert>

          {/* Request Details */}
          <div className="mb-4 p-3 bg-light rounded">
            <h6 className="mb-3">
              <span className="me-2"></span>
              Request Details
            </h6>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-2">
                  <strong>Amount:</strong> 
                  <span className="ms-2 text-success fw-bold">{formatCurrency(amount)}</span>
                </div>
                <div className="mb-2">
                  <strong>Department:</strong> 
                  <span className="ms-2">{departmentName}</span>
                </div>
                <div className="mb-2">
                  <strong>Category:</strong> 
                  <span className="ms-2">{categoryName}</span>
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-2">
                  <strong>Submitted:</strong> 
                  <span className="ms-2">{formatDate(createdAt)}</span>
                </div>
                <div className="mb-2">
                  <strong>Status:</strong> 
                  <Badge bg="warning" className="ms-2">Pending Review</Badge>
                </div>
                <div className="mb-2">
                  <strong>Request ID:</strong> 
                  <span className="ms-2 font-monospace">{requestId}</span>
                </div>
              </div>
            </div>
            <div className="mt-3">
              <strong> Reason:</strong>
              <div className="mt-2 p-2 bg-white rounded border">
                {reason}
              </div>
            </div>
          </div>

          {/* Review Decision */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">
              <span className="me-2"></span>
              Review Decision *
            </Form.Label>
            <div className="mt-2">
              <Form.Check
                type="radio"
                id="approve"
                label={
                  <span>
                    <span className="me-2"></span>
                    <strong className="text-success">Approve Request</strong>
                    <small className="d-block text-muted mt-1">
                      This will approve the budget adjustment and notify the department
                    </small>
                  </span>
                }
                value="true"
                {...register('approve', {
                  required: 'Please select a decision'
                })}
                className="mb-3"
              />
              <Form.Check
                type="radio"
                id="reject"
                label={
                  <span>
                    <span className="me-2"></span>
                    <strong className="text-danger">Reject Request</strong>
                    <small className="d-block text-muted mt-1">
                      This will reject the budget adjustment and notify the department
                    </small>
                  </span>
                }
                value="false"
                {...register('approve', {
                  required: 'Please select a decision'
                })}
              />
            </div>
            {errors.approve && (
              <div className="invalid-feedback d-block">
                <span className="me-1"></span>
                {errors.approve.message}
              </div>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">
              <span className="me-2"></span>
              Review Notes (Optional)
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Add any notes or comments about this decision..."
              {...register('reviewerNote', {
                maxLength: {
                  value: 500,
                  message: 'Notes cannot exceed 500 characters'
                }
              })}
              isInvalid={!!errors.reviewerNote}
            />
            <Form.Control.Feedback type="invalid">
              {errors.reviewerNote?.message}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              <span className="me-1"></span>
              These notes will be visible to the requesting department and can help explain your decision
            </Form.Text>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer className="d-flex justify-content-between">
          <div>
            <small className="text-muted">
              <span className="me-1"></span>
              Review will be recorded with timestamp
            </small>
          </div>
          <div>
            <Button variant="outline-secondary" onClick={handleClose} disabled={loading}>
              <span className="me-1"></span>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              disabled={loading}
              className="ms-2"
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Processing...
                </>
              ) : (
                <>
                  <span className="me-1"></span>
                  Submit Review
                </>
              )}
            </Button>
          </div>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ReviewModal;
