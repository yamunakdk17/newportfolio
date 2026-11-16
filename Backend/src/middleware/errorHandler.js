export function errorHandler(error, _request, response, _next) {
  const status = Number(error?.statusCode || error?.status || 500);
  if (error?.type === 'entity.too.large') {
    return response.status(413).json({ error: 'Request payload is too large.' });
  }
  if (error instanceof SyntaxError && error?.type === 'entity.parse.failed') {
    return response.status(400).json({ error: 'Request body must contain valid JSON.' });
  }
  if (status >= 500) {
    console.error(error);
    return response.status(status).json({ error: 'The request could not be completed. Please try again later.' });
  }
  const message = error?.message || 'The request could not be completed.';
  return response.status(status).json({ error: message });
}
