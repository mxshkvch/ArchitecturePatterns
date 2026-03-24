class TokenManager {
  constructor() {
    this.tokenKey = 'access_token';
    this.roleKey = 'user_role';
    this.emailKey = 'user_email';
    this.userIdKey = 'user_id';
    this.userKey = 'user';
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
  
  getTokenFromUrl() {
    console.log('\n🔍 ===== getTokenFromUrl START =====');
    
    const params = new URLSearchParams(window.location.search);
    let token = params.get('token');
    let role = params.get('role');
    
    if (!token) {
      token = sessionStorage.getItem('url_token');
      role = sessionStorage.getItem('url_role');
      if (token) {
        sessionStorage.removeItem('url_token');
        sessionStorage.removeItem('url_role');
      }
    }
  
    if (token && role === 'staff') {
      this.setToken(token);
      localStorage.setItem(this.roleKey, role);
      
      const decoded = this.decodeJWT(token);
      if (decoded) {
        if (decoded.email) localStorage.setItem(this.emailKey, decoded.email);
        if (decoded.nameid) localStorage.setItem(this.userIdKey, decoded.nameid);
        if (decoded.role) localStorage.setItem('user_role_from_token', decoded.role);
      }
      
      window.history.replaceState({}, document.title, window.location.pathname);
      return token;
    }
    
    return this.getToken();
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
        const expTime = decoded.exp * 1000;
        return Date.now() < expTime;
      }
      return true;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return false;
    }
  }
  
  getUserFromToken() {
    const token = this.getToken();
    if (!token) return null;
    return this.decodeJWT(token);
  }
  
  setUser(user) {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }
  
  getUser() {
    try {
      const userStr = localStorage.getItem(this.userKey);
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }
  
  clear() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.roleKey);
    localStorage.removeItem(this.emailKey);
    localStorage.removeItem(this.userIdKey);
    localStorage.removeItem('user_role_from_token');
    localStorage.removeItem(this.userKey);
    localStorage.removeItem('token');
  }
  
  isAuthenticated() {
    const token = this.getToken();
    const role = localStorage.getItem(this.roleKey);
    
    if (!token || !role || role !== 'staff') {
      return false;
    }
    
    return this.isTokenValid();
  }
  
  getRole() {
    return localStorage.getItem(this.roleKey);
  }
  
  getEmail() {
    return localStorage.getItem(this.emailKey);
  }
  
  getUserId() {
    return localStorage.getItem(this.userIdKey);
  }
}

export const tokenManager = new TokenManager();