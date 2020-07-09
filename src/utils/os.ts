import {platform as Platform} from 'os';

export function getOS() {
  const platform = Platform();
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
  const platform = Platform();
  if (platform === 'win32') {
    return '\\';
  }
  return '/';
}
