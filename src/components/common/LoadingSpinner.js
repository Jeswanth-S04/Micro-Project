import React from 'react';
import { Spinner, Container } from 'react-bootstrap';

const LoadingSpinner = ({ size = 'lg', text = 'Loading...' }) => {
  return (
    <Container fluid className="d-flex justify-content-center align-items-center vh-100">
      <div className="text-center">
        <Spinner animation="border" variant="primary" size={size} />
        <p className="mt-3 text-muted">{text}</p>
      </div>
    </Container>
  );
};

export default LoadingSpinner;
