const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
const NAME_REGEX = /^[A-Za-z\s]{2,50}$/;
const URL_REGEX = /^https?:\/\/.+/i;

function validateEmail(email) {
  if (typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim());
}

function validatePassword(password) {
  if (typeof password !== 'string') return false;
  return PASSWORD_REGEX.test(password);
}

function validateName(name) {
  if (typeof name !== 'string') return false;
  return NAME_REGEX.test(name.trim());
}

function validateWorkspaceName(name) {
  if (typeof name !== 'string') return false;
  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 100;
}

function validateUrl(url) {
  if (typeof url !== 'string') return false;
  return URL_REGEX.test(url.trim());
}

function sanitizeHtml(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export { validateEmail, validatePassword, validateName, validateWorkspaceName, validateUrl, sanitizeHtml };
