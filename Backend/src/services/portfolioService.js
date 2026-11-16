import {
  addMessage,
  addProject,
  deleteMessage,
  deleteProject,
  getAdminCollections,
  getCvUrl,
  getMessages,
  getProjectById,
  getPublishedProjectBySlug,
  getPublicPortfolio,
  saveAbout,
  saveCollection,
  saveCvUrl,
  setProjectPublished,
  updateMessage,
  updateProject,
} from '../models/portfolioModel.js';

export async function getPortfolioPayload() {
  const data = await getPublicPortfolio();

  return {
    site: {
      ...(data.site || {}),
      cvUrl: data.site?.cvUrl || '',
    },
    projects: (data.projects || []).map((project) => ({
      ...project,
      tags: Array.isArray(project.tags) ? project.tags : [],
      demo: project.demo || project.project_url || '',
      code: project.code || project.github_url || '',
    })),
    about: data.about || {
      title: 'About me',
      description: '',
      additionalDescription: '',
      highlights: [],
    },
    services: data.services || data.capabilities || [],
    stack: data.stack || [],
    experience: data.experience || [],
    education: data.education || [],
    achievements: data.achievements || [],
  };
}

export async function getAdminPayload() {
  return getAdminCollections();
}

export async function createProject(payload) {
  return addProject(payload);
}

export async function replaceProject(projectId, payload) {
  return updateProject(projectId, payload);
}

export async function removeProject(projectId) {
  return deleteProject(projectId);
}

export async function getProject(projectId) {
  return getProjectById(projectId);
}

export async function getPublishedProject(slug) {
  return getPublishedProjectBySlug(slug);
}

export async function changeProjectPublished(projectId, published) {
  return setProjectPublished(projectId, published);
}

export async function updateContent(collectionName, payload) {
  return saveCollection(collectionName, payload);
}

export async function saveAboutContent(payload) {
  return saveAbout(payload);
}

export async function registerContactMessage(payload) {
  return addMessage(payload);
}

export async function markMessageAsRead(messageId, nextReadState) {
  return updateMessage(messageId, {
    is_read: nextReadState,
  });
}

export async function removeMessage(messageId) {
  return deleteMessage(messageId);
}

export async function listContactMessages() {
  return getMessages();
}

export async function getPublicCvUrl() {
  return getCvUrl();
}

export async function savePublicCvUrl(cvUrl) {
  return saveCvUrl(cvUrl);
}
