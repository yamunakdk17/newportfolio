import { getPortfolioPayload, getAdminPayload, createProject, replaceProject, removeProject, getPublishedProject, changeProjectPublished, updateContent, saveAboutContent, registerContactMessage, listContactMessages, markMessageAsRead, removeMessage } from '../services/portfolioService.js';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isMysqlEnabled, useFallbackStore } from '../config/database.js';
import { sendContactNotification } from '../services/mailService.js';

const respond = (response, status, payload) => response.status(status).json(payload);

export async function getHealthController(_request, response) {
  respond(response, 200, {
    ok: true,
    database: isMysqlEnabled() && !useFallbackStore() ? 'mysql' : 'json-development',
  });
}

export async function getPublicPortfolioController(_request, response) {
  const payload = await getPortfolioPayload();
  respond(response, 200, payload);
}

export async function getPublicCollectionController(request, response) {
  const payload = await getPortfolioPayload();
  const map = {
    '/projects': payload.projects,
    '/about': payload.about,
    '/capabilities': payload.services,
    '/experience': payload.experience,
    '/education': payload.education,
    '/certifications': payload.achievements,
  };
  respond(response, 200, Object.prototype.hasOwnProperty.call(map, request.path) ? map[request.path] : payload);
}

export async function getPublicProjectController(request, response) {
  const project = await getPublishedProject(request.params.slug);
  if (!project) return respond(response, 404, { error: 'Project not found.' });
  respond(response, 200, project);
}

export async function submitContactController(request, response) {
  const body = request.body || {};
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim();
  const subject = String(body.subject || '').trim();
  const message = String(body.message || '').trim();

  if (name.length < 2 || name.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || subject.length < 2 || subject.length > 180 || message.length < 5 || message.length > 5000) {
    return respond(response, 400, { error: 'Enter a valid name, email, subject, and message.' });
  }

  const saved = await registerContactMessage({ name, email, subject, message, createdAt: new Date().toISOString() });
  try {
    const sent = await sendContactNotification(saved);
    if (!sent) return respond(response, 503, { error: 'Message saved, but email delivery is not configured.' });
  } catch (error) {
    console.error(error);
    return respond(response, 502, { error: 'Message saved, but email delivery failed. Please try again later.' });
  }
  respond(response, 201, { ok: true, message: 'Thanks for reaching out. Your message has been sent successfully.', saved });
}

export async function getAdminProjectsController(_request, response) {
  const payload = await getAdminPayload();
  respond(response, 200, payload.projects || []);
}

export async function getAdminCollectionController(request, response) {
  const payload = await getAdminPayload();
  const key = request.params.collection;
  respond(response, 200, payload[key] || []);
}

export async function createProjectController(request, response) {
  const project = request.validatedProject;
  const created = await createProject(project);
  respond(response, 201, created);
}

export async function updateProjectController(request, response) {
  const projectId = request.params.id;
  const project = request.validatedProject;
  const updated = await replaceProject(projectId, project);
  respond(response, 200, updated);
}

export async function deleteProjectController(request, response) {
  const projectId = request.params.id;
  await removeProject(projectId);
  respond(response, 200, { ok: true });
}

export async function publishProjectController(request, response) {
  const updated = await changeProjectPublished(request.params.id, request.body.published);
  respond(response, 200, updated);
}

export async function saveAdminCollectionController(request, response) {
  const collection = request.params.collection;
  const body = request.body || {};
  const payload = collection === 'about' ? body[collection] || body : body[collection] || body;
  if (collection === 'about') {
    const result = await saveAboutContent(payload);
    return respond(response, 200, result);
  }
  const updated = await updateContent(collection, payload);
  return respond(response, 200, updated);
}

export async function listMessagesController(_request, response) {
  const messages = await listContactMessages();
  respond(response, 200, messages);
}

export async function updateMessageController(request, response) {
  const messageId = request.params.id;
  const body = request.body || {};
  const updated = await markMessageAsRead(messageId, !!body.is_read);
  respond(response, 200, updated);
}

export async function deleteMessageController(request, response) {
  const messageId = request.params.id;
  await removeMessage(messageId);
  respond(response, 200, { ok: true });
}

export async function uploadImageController(request, response) {
  const body = request.body || {};
  const dataUrl = String(body.data || '');
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) {
    return respond(response, 400, { error: 'Upload JPG, PNG, or WEBP images only.' });
  }

  const mime = match[1];
  const extension = mime.includes('png') ? '.png' : mime.includes('webp') ? '.webp' : '.jpg';
  const buffer = Buffer.from(match[2], 'base64');
  if (!buffer.length || buffer.length > 8 * 1024 * 1024) {
    return respond(response, 413, { error: 'Image must be smaller than 8 MB.' });
  }
  const validSignature = mime === 'image/jpeg'
    ? buffer.length > 2 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
    : mime === 'image/png'
      ? buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
      : buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
  if (!validSignature) return respond(response, 400, { error: 'The file contents do not match a supported image format.' });

  const { randomUUID } = await import('node:crypto');
  const filename = `${randomUUID()}${extension}`;
  const { mkdir, writeFile } = await import('node:fs/promises');
  const uploadDir = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'uploads');
  await mkdir(uploadDir, { recursive: true });
  await writeFile(join(uploadDir, filename), buffer);

  respond(response, 201, { url: `/uploads/${filename}` });
}
