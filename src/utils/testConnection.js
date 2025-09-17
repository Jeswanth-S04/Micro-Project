export const testBackendConnection = async () => {
    try {
      const response = await fetch('http://localhost:5022/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@test.com',
          password: 'test123'
        })
      });
      
      console.log('Backend connection test:', response.status);
      return response.status !== 0; // 0 means no connection
    } catch (error) {
      console.error('Backend connection failed:', error);
      return false;
    }
  };
  