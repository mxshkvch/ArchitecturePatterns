class AuthService {
  constructor() {
    this.tokenKey = 'access_token';
    this.roleKey = 'user_role';
    this.userKey = 'user';
  }
  async createUser(userData) {
    try {
      console.log('📡 [AuthService] Creating user:', userData);
      const response = await authApiClient.post(ENDPOINTS.AUTH.CREATE_USER, userData);
      console.log('✅ [AuthService] User created:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [AuthService] Error creating user:', error);
      throw error;
    }
  }
  
  decodeJWT(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Error decoding JWT:', e);
      return null;
    }
  }
  
  getToken() {
    return localStorage.getItem(this.tokenKey);
  }
  
  setToken(token) {
    localStorage.setItem(this.tokenKey, token);
  }
  
  isTokenValid() {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      const decoded = this.decodeJWT(token);
      if (decoded && decoded.exp) {
        return Date.now() < decoded.exp * 1000;
      }
      return true;
    } catch (error) {
      return false;
    }
  }
  
  isAuthenticated() {
    const token = this.getToken();
    const role = localStorage.getItem(this.roleKey);
    return !!(token && role === 'staff' && this.isTokenValid());
  }
  
  getRole() {
    return localStorage.getItem(this.roleKey);
  }
  
  getUser() {
    try {
      const userStr = localStorage.getItem(this.userKey);
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }
  
  logout() {
    console.log('🚪 Logging out...');
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.roleKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_id');
    window.location.href = 'http://localhost:5175/login';
  }
  
  initialize() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const role = urlParams.get('role');
    
    if (token && role === 'staff') {
      console.log('✅ Token found in URL, saving...');
      this.setToken(token);
      localStorage.setItem(this.roleKey, role);
      
      const decoded = this.decodeJWT(token);
      if (decoded) {
        if (decoded.email) localStorage.setItem('user_email', decoded.email);
        if (decoded.nameid) localStorage.setItem('user_id', decoded.nameid);
        
        const user = {
          id: decoded.nameid,
          email: decoded.email,
          role: decoded.role
        };
        localStorage.setItem(this.userKey, JSON.stringify(user));
      }
      
      window.history.replaceState({}, document.title, window.location.pathname);
      return true;
    }
    
    return false;
  }
  
  async login(email, password) {
    console.log('Login attempt:', email);
    throw new Error('Login not implemented yet');
  }
}

export const authService = new AuthService();

export const isAuthenticated = () => authService.isAuthenticated();
export const logout = () => authService.logout();
export const getAuthToken = () => authService.getToken();
export const getTokenFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('token');
};
export const initializeAuth = () => authService.initialize();