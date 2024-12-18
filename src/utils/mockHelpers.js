// mockHelpers berfungsi untuk menyederhanakan dan mempercepat proses pembuatan objek req (request) dan res (response) dalam pengujian
export const mockResponse = () => {
    const res = {};
    res.status = vi.fn().mockImplementation((status) => res);
    res.json = vi.fn();
    return res;
  };
  
  export const mockRequest = (options = {}) => ({
    query: options.query || {},
    body: options.body || {},
    params: options.params || {},
  });
  