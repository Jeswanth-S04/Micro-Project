import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const Analytics = () => {
  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h2>Analytics Dashboard</h2>
          <p className="text-muted">Comprehensive budget analytics and insights</p>
        </Col>
      </Row>
      
      <Row>
        <Col>
          <Card>
            <Card.Body className="text-center py-5">
              <i className="bi bi-graph-up fs-1 text-primary mb-3"></i>
              <h4>Analytics Coming Soon</h4>
              <p className="text-muted">
                Advanced analytics and reporting features will be available here.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Analytics;
