import { post } from '../utils/service';

export const authProvider = {
  login: async ({ email, password }) => {
    try {
      const response = await post('users/login', { email, password });
      
      if (response.status === 200) {
        const { username, user_type: role, email: userEmail, jwt } = response.data;
        
        localStorage.setItem('name', username);
        localStorage.setItem('email', userEmail);
        localStorage.setItem('role', role);
        localStorage.setItem('jwt', jwt);
        localStorage.setItem('isLoggedIn', 'true');
        
        return {
          success: true,
          redirectTo: '/dashboard',
        };
      } else {
        return {
          success: false,
          error: {
            name: 'LoginError',
            message: response.message || 'Login failed. Please check your credentials.',
          },
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'An error occurred while logging in. Please try again.';
      
      if (error.response) {
        errorMessage = error.response.data?.message || 'Invalid credentials';
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your connection.';
      }
      
      return {
        success: false,
        error: {
          name: 'LoginError',
          message: errorMessage,
        },
      };
    }
  },

  logout: async () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('email');
    localStorage.removeItem('name');
    localStorage.removeItem('role');
    localStorage.removeItem('jwt');
    
    return {
      success: true,
      redirectTo: '/login',
    };
  },

  check: async () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const jwt = localStorage.getItem('jwt');
    const email = localStorage.getItem('email');
    
    if (isLoggedIn && jwt && email) {
      return {
        authenticated: true,
      };
    }
    
    return {
      authenticated: false,
      redirectTo: '/login',
    };
  },

  getPermissions: async () => {
    const role = localStorage.getItem('role');
    return role ? [role] : [];
  },

  getIdentity: async () => {
    const email = localStorage.getItem('email');
    const name = localStorage.getItem('name');
    const role = localStorage.getItem('role');
    
    if (email && name) {
      return {
        id: email,
        name,
        email,
        role,
        avatar: null,
      };
    }
    
    return null;
  },

  onError: async (error) => {
    if (error.response?.status === 401) {
      return {
        logout: true,
      };
    }
    
    return { error };
  },
};