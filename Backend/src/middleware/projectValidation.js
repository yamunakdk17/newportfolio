const isValidWebUrl = (value) => {
  if (!value) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
};

export function validateProject(request, response, next) {
  const body = request.body || {};
  const title = String(body.title || '').trim();
  const description = String(body.description || body.desc || '').trim();
  const technologies = body.technologies ?? body.tags ?? [];
  const image = String(body.image || '').trim();
  const projectUrl = String(body.project_url || body.demo || '').trim();
  const githubUrl = String(body.github_url || body.code || '').trim();

  if (title.length < 2 || title.length > 200) {
    return response.status(400).json({ error: 'Project title must be between 2 and 200 characters.' });
  }
  if (description.length < 5 || description.length > 10000) {
    return response.status(400).json({ error: 'Project description must be between 5 and 10,000 characters.' });
  }
  if (!Array.isArray(technologies) || technologies.length > 30 || technologies.some((item) => typeof item !== 'string' || item.trim().length > 80)) {
    return response.status(400).json({ error: 'Technologies must be a list of up to 30 text values.' });
  }
  if (image.length > 255 || /^blob:|^data:/i.test(image) || (image && !/^\/uploads\/[a-zA-Z0-9._-]+$/.test(image) && !isValidWebUrl(image))) {
    return response.status(400).json({ error: 'Project image must be an uploaded image path or a valid HTTP(S) URL.' });
  }
  if (!isValidWebUrl(projectUrl) || !isValidWebUrl(githubUrl)) {
    return response.status(400).json({ error: 'Project and GitHub URLs must use HTTP or HTTPS.' });
  }
  if (body.published !== undefined && typeof body.published !== 'boolean') {
    return response.status(400).json({ error: 'Published status must be true or false.' });
  }

  request.validatedProject = {
    title,
    description,
    technologies: technologies.map((item) => item.trim()).filter(Boolean),
    image,
    project_url: projectUrl,
    github_url: githubUrl,
    published: body.published === true,
  };
  return next();
}

export function validatePublishStatus(request, response, next) {
  if (typeof request.body?.published !== 'boolean') {
    return response.status(400).json({ error: 'Published status must be true or false.' });
  }
  return next();
}
