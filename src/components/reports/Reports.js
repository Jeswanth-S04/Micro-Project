import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const Reports = () => {
  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h2>Budget Reports</h2>
          <p className="text-muted">Generate and download comprehensive budget reports</p>
        </Col>
      </Row>
      
      <Row>
        <Col>
          <Card>
            <Card.Body className="text-center py-5">
              <i className="bi bi-file-earmark-bar-graph fs-1 text-success mb-3"></i>
              <h4>Reports Coming Soon</h4>
              <p className="text-muted">
                Detailed reporting and export functionality will be available here.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Reports;
