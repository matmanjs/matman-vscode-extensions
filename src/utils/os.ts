const os = require('os');

export function getOS() {
  const platform = os.platform();
  if (platform === 'darwin') {
    return 'MAC OS';
  }
  if (platform === 'win32') {
    return 'Windows';
  }
  if (platform === 'linux') {
    return 'Linux';
  }
  return platform;
}

export function getFileSeparator() {
  const platform = os.platform();
  if (platform === 'win32') {
    return '\\';
  }
  return '/';
}
