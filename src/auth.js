const USERS_KEY = 'cosmotiers.auth.users.v1';
const SESSION_KEY = 'cosmotiers.auth.session.v1';
const PBKDF2_ITERATIONS = 310000;
const OWNER_USERNAME = 'cosmic gamer';

let currentUser = null;
let activeAuthMode = 'signin';
let showModal;
let closeModal;
let showToast;

function normalizeUsername(value) {
  return String(value || '').trim().replace(/\s+/g, ' ').toLocaleLowerCase();
}

function normalizeEmail(value) {
  return String(value || '').trim().toLocaleLowerCase();
}


function getUsers() {
  try {
    const parsed = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((user) => user && typeof user.id === 'string' &&
      typeof user.username === 'string' && typeof user.normalizedUsername === 'string' &&
      typeof user.email === 'string' && user.password &&
      typeof user.password.salt === 'string' && typeof user.password.hash === 'string');
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function bytesToBase64(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function equalBytes(left, right) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left[index] ^ right[index];
  return difference === 0;
}

async function derivePasswordHash(password, salt) {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Secure password protection is unavailable here. Open CosmoTiers through localhost or HTTPS.');
  }
  const keyMaterial = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits({
    name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256',
  }, keyMaterial, 256);
  return new Uint8Array(bits);
}

async function createPasswordRecord(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derivePasswordHash(password, salt);
  return { salt: bytesToBase64(salt), hash: bytesToBase64(hash), iterations: PBKDF2_ITERATIONS, algorithm: 'PBKDF2-SHA256' };
}

async function verifyPassword(password, record) {
  const salt = base64ToBytes(record.salt);
  const actual = await derivePasswordHash(password, salt);
  const expected = base64ToBytes(record.hash);
  return equalBytes(actual, expected);
}

function displayInitials(username) {
  const parts = String(username || 'CT').trim().split(/\s+/).filter(Boolean);
  if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
  return parts[0].slice(0, 2).toUpperCase();
}

function setAvatarElement(container, user, imageId = null, initialsId = null) {
  if (imageId && initialsId) {
    const image = document.getElementById(imageId);
    const initials = document.getElementById(initialsId);
    if (user?.avatar) {
      image.src = user.avatar;
      image.hidden = false;
      initials.hidden = true;
    } else {
      image.removeAttribute('src');
      image.hidden = true;
      initials.textContent = displayInitials(user?.username);
      initials.hidden = false;
    }
    return;
  }

  container.textContent = '';
  if (user?.avatar) {
    const image = document.createElement('img');
    image.src = user.avatar;
    image.alt = '';
    container.append(image);
  } else {
    container.textContent = displayInitials(user?.username);
  }
}

function updateAuthUI(user) {
  currentUser = user || null;
  const authButtons = document.getElementById('authButtons');
  const profileControl = document.getElementById('profileControl');
  const profileMenu = document.getElementById('profileMenu');
  const profileTrigger = document.getElementById('profileTrigger');
  authButtons.hidden = Boolean(currentUser);
  profileControl.hidden = !currentUser;
  profileMenu.hidden = true;
  profileTrigger.setAttribute('aria-expanded', 'false');

  if (!currentUser) return;
  setAvatarElement(null, currentUser, 'profileTriggerImage', 'profileTriggerInitials');
  setAvatarElement(document.getElementById('profileMenuAvatar'), currentUser);
  document.getElementById('profileMenuName').textContent = currentUser.username;
  document.getElementById('profileMenuEmail').textContent = currentUser.email;
  document.getElementById('profileMenuRole').textContent = currentUser.role === 'owner' ? 'OWNER ACCOUNT' : 'LOCAL MEMBER';
  profileTrigger.setAttribute('aria-label', `Account menu for ${currentUser.username}`);
}

function restoreSession() {
  try {
    const id = localStorage.getItem(SESSION_KEY);
    if (!id) return null;
    const user = getUsers().find((entry) => entry.id === id);
    if (!user) localStorage.removeItem(SESSION_KEY);
    return user || null;
  } catch {
    return null;
  }
}

function providerButtons() {
  return `
    <div class="auth-provider-grid">
      <button class="auth-provider-btn" type="button" data-provider="google"><span class="provider-mark provider-google">G</span><span>Continue with Google</span></button>
      <button class="auth-provider-btn" type="button" data-provider="discord"><span class="provider-mark provider-discord">◈</span><span>Continue with Discord</span></button>
    </div>
    <div class="auth-separator"><span>OR USE EMAIL AND PASSWORD</span></div>
    <p class="auth-provider-status" id="authProviderStatus" aria-live="polite" hidden></p>
  `;
}

function renderAuthForm(mode) {
  activeAuthMode = mode;
  document.querySelectorAll('[data-auth-mode]').forEach((button) => {
    const active = button.dataset.authMode === mode;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', String(active));
  });
  document.getElementById('authTitle').textContent = mode === 'signup' ? 'Create your account' : 'Welcome back';

  const signup = mode === 'signup';
  document.getElementById('authContent').innerHTML = `
    ${providerButtons()}
    <form id="authForm" class="auth-form" novalidate>
      ${signup ? `
        <div class="form-row">
          <label for="authUsername">Username</label>
          <input class="form-control" id="authUsername" name="username" type="text" minlength="3" maxlength="20" autocomplete="username" placeholder="Choose a username" required>
          <p class="username-role-hint" id="usernameRoleHint">The username <strong>Cosmic Gamer</strong> is reserved for the local owner account.</p>
        </div>
        <div class="form-row">
          <label for="authEmail">Email address</label>
          <input class="form-control" id="authEmail" name="email" type="email" maxlength="254" autocomplete="email" placeholder="you@example.com" required>
        </div>
      ` : `
        <div class="form-row">
          <label for="authIdentity">Username or email</label>
          <input class="form-control" id="authIdentity" name="identity" type="text" autocomplete="username" placeholder="Your username or email" required>
        </div>
      `}
      <div class="form-row">
        <label for="authPassword">Password</label>
        <input class="form-control" id="authPassword" name="password" type="password" minlength="8" maxlength="128" autocomplete="${signup ? 'new-password' : 'current-password'}" placeholder="${signup ? 'At least 8 characters' : 'Enter your password'}" required>
      </div>
      ${signup ? `
        <div class="form-row">
          <label for="authConfirmPassword">Confirm password</label>
          <input class="form-control" id="authConfirmPassword" name="confirmPassword" type="password" minlength="8" maxlength="128" autocomplete="new-password" placeholder="Enter your password again" required>
        </div>
        <div class="form-row auth-avatar-row">
          <div class="auth-avatar-preview" id="authAvatarPreview">${displayInitials('Cosmo Tiers')}</div>
          <div class="auth-avatar-fields">
            <label for="authAvatar">Profile picture <span>(optional)</span></label>
            <input class="auth-file-input" id="authAvatar" name="avatar" type="file" accept="image/png,image/jpeg,image/webp,image/gif">
            <p class="form-hint">PNG, JPG, WEBP or GIF. Your picture stays in this browser.</p>
          </div>
        </div>
      ` : ''}
      <p class="auth-error" id="authError" role="alert" hidden></p>
      <button class="primary-btn auth-submit" type="submit">${signup ? 'Create account' : 'Sign in'}</button>
    </form>
    <p class="auth-local-note"><strong>Local account preview:</strong> accounts, email addresses and profile pictures are saved only in this browser. They are not shared with other visitors or devices.</p>
  `;

  const usernameInput = document.getElementById('authUsername');
  if (usernameInput) usernameInput.addEventListener('input', updateOwnerUsernameHint);
}

function updateOwnerUsernameHint() {
  const input = document.getElementById('authUsername');
  const hint = document.getElementById('usernameRoleHint');
  if (!input || !hint) return;
  const isOwner = normalizeUsername(input.value) === OWNER_USERNAME;
  hint.innerHTML = isOwner
    ? '<strong>Cosmic Gamer</strong> will receive the owner role in this browser.'
    : 'The username <strong>Cosmic Gamer</strong> is reserved for the local owner account.';
  hint.classList.toggle('owner-hint-active', isOwner);
}

function showAuthError(message) {
  const error = document.getElementById('authError');
  if (!error) return;
  error.textContent = message;
  error.hidden = false;
}

function validateUsername(value) {
  const normalized = normalizeUsername(value);
  return normalized.length >= 3 && normalized.length <= 20 && /^[a-z0-9_]+(?: [a-z0-9_]+)*$/i.test(normalized);
}

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

async function prepareAvatar(file) {
  if (!file) return '';
  if (!file.type.startsWith('image/')) throw new Error('Choose an image file for your profile picture.');
  if (file.size > 5 * 1024 * 1024) throw new Error('Your profile picture must be 5 MB or smaller.');

  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error('That image could not be opened. Try a PNG, JPG or WEBP file.');
  }
  const longestSide = Math.max(bitmap.width, bitmap.height);
  const scale = Math.min(1, 320 / longestSide);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext('2d');
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  return canvas.toDataURL('image/jpeg', 0.84);
}

async function handleSignup(form) {
  const data = new FormData(form);
  const rawUsername = String(data.get('username') || '').trim().replace(/\s+/g, ' ');
  const normalizedUsername = normalizeUsername(rawUsername);
  const email = String(data.get('email') || '').trim();
  const normalizedEmail = normalizeEmail(email);
  const password = String(data.get('password') || '');
  const confirmPassword = String(data.get('confirmPassword') || '');
  const avatarFile = document.getElementById('authAvatar')?.files?.[0];

  if (!validateUsername(rawUsername)) {
    showAuthError('Use 3–20 characters: letters, numbers, underscores and single spaces.');
    return;
  }
  if (!validateEmail(email)) {
    showAuthError('Enter a valid email address.');
    return;
  }
  if (password.length < 8 || password.length > 128) {
    showAuthError('Your password must be between 8 and 128 characters.');
    return;
  }
  if (password !== confirmPassword) {
    showAuthError('The passwords do not match.');
    return;
  }

  const users = getUsers();
  if (users.some((user) => user.normalizedUsername === normalizedUsername)) {
    showAuthError('That username is already registered in this browser. Choose another one or sign in.');
    return;
  }
  if (users.some((user) => user.normalizedEmail === normalizedEmail)) {
    showAuthError('That email address is already registered in this browser. Sign in instead.');
    return;
  }

  const submit = form.querySelector('[type="submit"]');
  submit.disabled = true;
  submit.textContent = 'Creating account…';
  try {
    const avatar = await prepareAvatar(avatarFile);
    const passwordRecord = await createPasswordRecord(password);
    const role = normalizedUsername === OWNER_USERNAME ? 'owner' : 'member';
    const user = {
      id: crypto.randomUUID ? crypto.randomUUID() : `ct-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      username: role === 'owner' ? 'Cosmic Gamer' : rawUsername,
      normalizedUsername,
      email,
      normalizedEmail,
      password: passwordRecord,
      avatar,
      role,
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    saveUsers(users);
    localStorage.setItem(SESSION_KEY, user.id);
    updateAuthUI(user);
    closeModal('authModal');
    showToast(role === 'owner' ? 'Cosmic Gamer owner account created on this browser.' : `Welcome to CosmoTiers, ${user.username}.`);
  } catch (error) {
    showAuthError(error instanceof Error ? error.message : 'Could not create your account. Check browser storage and try again.');
  } finally {
    if (submit.isConnected) {
      submit.disabled = false;
      submit.textContent = 'Create account';
    }
  }
}

async function handleSignin(form) {
  const data = new FormData(form);
  const identity = String(data.get('identity') || '').trim();
  const normalizedIdentity = normalizeUsername(identity);
  const normalizedEmail = normalizeEmail(identity);
  const password = String(data.get('password') || '');
  const user = getUsers().find((entry) =>
    entry.normalizedUsername === normalizedIdentity || entry.normalizedEmail === normalizedEmail
  );
  if (!user) {
    showAuthError('Username/email or password is incorrect.');
    return;
  }

  const submit = form.querySelector('[type="submit"]');
  submit.disabled = true;
  submit.textContent = 'Signing in…';
  try {
    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      showAuthError('Username/email or password is incorrect.');
      return;
    }
    localStorage.setItem(SESSION_KEY, user.id);
    updateAuthUI(user);
    closeModal('authModal');
    showToast(`Signed in as ${user.username}.`);
  } catch (error) {
    showAuthError(error instanceof Error ? error.message : 'Could not sign in. Try again.');
  } finally {
    if (submit.isConnected) {
      submit.disabled = false;
      submit.textContent = 'Sign in';
    }
  }
}

function openAuth(mode) {
  if (currentUser) return;
  renderAuthForm(mode);
  showModal('authModal');
}

export function initAuth(helpers) {
  showModal = helpers.showModal;
  closeModal = helpers.closeModal;
  showToast = helpers.showToast;

  document.getElementById('openSignup').addEventListener('click', () => openAuth('signup'));
  document.getElementById('openSignin').addEventListener('click', () => openAuth('signin'));

  document.querySelectorAll('[data-auth-mode]').forEach((button) => {
    button.addEventListener('click', () => renderAuthForm(button.dataset.authMode));
  });

  const authContent = document.getElementById('authContent');
  authContent.addEventListener('submit', async (event) => {
    if (event.target.id !== 'authForm') return;
    event.preventDefault();
    const error = document.getElementById('authError');
    error.hidden = true;
    if (activeAuthMode === 'signup') await handleSignup(event.target);
    else await handleSignin(event.target);
  });

  authContent.addEventListener('click', (event) => {
    const provider = event.target.closest('[data-provider]');
    if (!provider) return;
    const providerName = provider.dataset.provider === 'google' ? 'Google' : 'Discord';
    const status = document.getElementById('authProviderStatus');
    status.textContent = `${providerName} sign-in is not connected yet. It needs an OAuth application and a shared authentication backend before it can work.`;
    status.hidden = false;
  });

  authContent.addEventListener('change', async (event) => {
    if (event.target.id !== 'authAvatar') return;
    const preview = document.getElementById('authAvatarPreview');
    try {
      const avatarPreview = await prepareAvatar(event.target.files?.[0]);
      if (avatarPreview) {
        preview.innerHTML = `<img src="${avatarPreview}" alt="Profile picture preview">`;
      } else {
        preview.textContent = displayInitials('Cosmo Tiers');
      }
    } catch (error) {
      event.target.value = '';
          showAuthError(error.message);
    }
  });

  const trigger = document.getElementById('profileTrigger');
  const menu = document.getElementById('profileMenu');
  trigger.addEventListener('click', () => {
    const opening = menu.hidden;
    menu.hidden = !opening;
    trigger.setAttribute('aria-expanded', String(opening));
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('#profileControl')) {
      menu.hidden = true;
      trigger.setAttribute('aria-expanded', 'false');
    }
  });

  document.getElementById('signOutButton').addEventListener('click', () => {
    localStorage.removeItem(SESSION_KEY);
    updateAuthUI(null);
    showToast('You have signed out. Your local account is still saved.');
  });

  renderAuthForm('signin');
  updateAuthUI(restoreSession());
}
