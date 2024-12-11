// tests/utils/mockHelpers.js
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
  