import toast from 'react-hot-toast';

export const DEFAULT_RESUME_URL = 'https://drive.google.com/file/d/1BnZfqZSGfknYCVApsknJo9PyQZjvBYXV/view';

export function formatResumeUrl(rawUrl) {
  if (!rawUrl || rawUrl === '#' || rawUrl.trim() === '') {
    return DEFAULT_RESUME_URL;
  }
  let url = rawUrl.trim();

  // If user typed domain like drive.google.com/file... without https://
  if (!/^https?:\/\//i.test(url) && !url.startsWith('/')) {
    url = `https://${url}`;
  }
  return url;
}

export function handleOpenResume(e, rawUrl) {
  if (e) e.preventDefault();
  const url = formatResumeUrl(rawUrl);

  if (url && url !== '#') {
    window.open(url, '_blank', 'noopener,noreferrer');
  } else {
    toast.error('Resume PDF link will be available soon! 📄');
  }
}
