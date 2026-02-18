// Demo accounts for showcasing MindCheck to schools
export const DEMO_ACCOUNTS = {
  'joel@fuelmysocial.com.au': {
    password: 'ABC123!',
    role: 'owner',
    name: 'Joel',
    email: 'joel@fuelmysocial.com.au',
  },
  'principal@demoschool.com.au': {
    password: 'ABC123!',
    role: 'principal',
    name: 'Demo Principal',
    email: 'principal@demoschool.com.au',
    school: 'Demo School',
  },
  'teacher@demoschool.com.au': {
    password: 'ABC123!',
    role: 'teacher',
    name: 'Demo Teacher',
    email: 'teacher@demoschool.com.au',
  },
};

export function getDemoUser() {
  try {
    const stored = localStorage.getItem('mindcheck_demo_user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function setDemoUser(user) {
  localStorage.setItem('mindcheck_demo_user', JSON.stringify(user));
}

export function clearDemoUser() {
  localStorage.removeItem('mindcheck_demo_user');
}

export function attemptDemoLogin(email, password, requiredRole) {
  const account = DEMO_ACCOUNTS[email.trim().toLowerCase()];
  if (!account || account.password !== password) return null;
  if (requiredRole && account.role !== requiredRole) return null;

  const demoUser = {
    id: `demo-${account.role}-${Date.now()}`,
    email: account.email,
    user_metadata: {
      role: account.role,
      full_name: account.name,
      school: account.school || null,
    },
  };

  setDemoUser(demoUser);
  return demoUser;
}
