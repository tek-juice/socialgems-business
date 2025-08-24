import { get, post, put, del, patch } from '../utils/service';

export const dataProvider = {
  getList: async ({ resource, pagination, filters, sorters, meta }) => {
    const { current = 1, pageSize = 10 } = pagination || {};
    
    const queryParams = {
      page: current,
      limit: pageSize,
      ...filters,
      ...sorters,
    };

    try {
      const response = await get(`${resource}`, queryParams);
      
      return {
        data: response.data || response,
        total: response.total || response.length || 0,
      };
    } catch (error) {
      throw error;
    }
  },

  getOne: async ({ resource, id, meta }) => {
    try {
      const response = await get(`${resource}/${id}`);
      return {
        data: response.data || response,
      };
    } catch (error) {
      throw error;
    }
  },

  create: async ({ resource, variables, meta }) => {
    try {
      const response = await post(`${resource}`, variables);
      return {
        data: response.data || response,
      };
    } catch (error) {
      throw error;
    }
  },

  update: async ({ resource, id, variables, meta }) => {
    try {
      const response = await put(`${resource}/${id}`, variables);
      return {
        data: response.data || response,
      };
    } catch (error) {
      throw error;
    }
  },

  deleteOne: async ({ resource, id, meta }) => {
    try {
      const response = await del(`${resource}/${id}`);
      return {
        data: response.data || response,
      };
    } catch (error) {
      throw error;
    }
  },

  getApiUrl: () => {
    return window.location.hostname.includes('socialgems.me') 
      // ? 'https://api.socialgems.me/'
      ? 'https://api-v2.socialgems.me/'
      : 'https://gems.tekjuice.xyz/';
  },

  custom: async ({ url, method, filters, sorters, payload, query, headers, meta }) => {
    try {
      let response;
      
      switch (method.toLowerCase()) {
        case 'get':
          response = await get(url, query);
          break;
        case 'post':
          response = await post(url, payload);
          break;
        case 'put':
          response = await put(url, payload);
          break;
        case 'patch':
          response = await patch(url, payload);
          break;
        case 'delete':
          response = await del(url);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      return {
        data: response.data || response,
      };
    } catch (error) {
      throw error;
    }
  },
};