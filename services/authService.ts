import emailjs from '@emailjs/browser';
import { User, UserRole } from '../types';
import { EMAILJS_CONFIG } from '../constants';

const USERS_KEY = 'alcortex_users';
const CURRENT_USER_KEY = 'alcortex_current_user';

export const register = async (
  name: string, 
  email: string, 
  role: UserRole, 
  password: string,
  licenseId: string,
  preferredLanguage: 'en' | 'id' | 'ru'
): Promise<User> => {
  const usersStr = localStorage.getItem(USERS_KEY);
  const users: User[] = usersStr ? JSON.parse(usersStr) : [];

  if (users.find(u => u.email === email)) {
    throw new Error('Email already registered');
  }

  const passwordHash = btoa(password); 

  const newUser: User = {
    id: crypto.randomUUID(),
    name,
    email,
    role,
    licenseId,
    preferredLanguage,
    passwordHash,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
  
  // Also save language to global localstorage for immediate context pickup
  localStorage.setItem('app_language', preferredLanguage);
  
  return newUser;
};

export const login = async (email: string, password: string): Promise<User> => {
  const usersStr = localStorage.getItem(USERS_KEY);
  const users: User[] = usersStr ? JSON.parse(usersStr) : [];
  const user = users.find(u => u.email === email && u.passwordHash === btoa(password));
  if (!user) throw new Error('Invalid credentials');
  
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  localStorage.setItem('app_language', user.preferredLanguage);
  
  return user;
};

export const logout = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
  window.location.reload();
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem(CURRENT_USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

export const resetPassword = async (email: string): Promise<void> => {
  const usersStr = localStorage.getItem(USERS_KEY);
  const users: User[] = usersStr ? JSON.parse(usersStr) : [];
  const user = users.find(u => u.email === email);
  if (!user) throw new Error('Email not found');
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  try {
    await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      {
        to_email: email,
        to_name: user.name,
        message: `Your password reset code for AlCortex is: ${resetCode}.`,
        from_name: 'AlCortex Security'
      },
      EMAILJS_CONFIG.PUBLIC_KEY
    );
    alert(`Reset code sent to ${email}`);
    return;
  } catch (error) {
    throw new Error('Failed to send reset email');
  }
};