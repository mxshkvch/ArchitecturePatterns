export const getTokenFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const role = params.get('role');
  
  console.log('🔍 getTokenFromUrl called');
  console.log('  - URL:', window.location.href);
  console.log('  - token param:', token ? `${token.substring(0, 50)}...` : 'not found');
  console.log('  - role param:', role || 'not found');
  
  if (token && role === 'client') {
    try {
      const payload = JSON.parse(atob(token));
      console.log('✅ Token decoded:', {
        email: payload.email,
        role: payload.role,
        exp: new Date(payload.exp).toLocaleString()
      });
      
      localStorage.setItem('access_token', token);
      localStorage.setItem('user_role', role);
      localStorage.setItem('user_email', payload.email);
      
      window.history.replaceState({}, document.title, window.location.pathname);
      console.log('✅ Token saved, URL cleaned');
      
      return { token, role, email: payload.email };
    } catch (err) {
      console.error('❌ Error decoding token:', err);
      return null;
    }
  }
  
  return null;
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('access_token');
  const role = localStorage.getItem('user_role');
  
  if (!token || !role || role !== 'client') {
    return false;
  }
  
  try {
    const payload = JSON.parse(atob(token));
    if (payload.exp && payload.exp < Date.now()) {
      console.log('⏰ Token expired');
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

export const logout = () => {
  console.log('🚪 Logging out from client-bank');
  localStorage.removeItem('access_token');
  localStorage.removeItem('user_role');
  localStorage.removeItem('user_email');
  window.location.href = 'http://localhost:5175/login';
};