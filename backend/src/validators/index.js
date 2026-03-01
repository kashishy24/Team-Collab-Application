import Joi from 'joi';

export const projectCreate = Joi.object({
  name: Joi.string().required().trim().min(1).max(200),
  description: Joi.string().trim().max(2000).allow(''),
});

export const projectUpdate = Joi.object({
  name: Joi.string().trim().min(1).max(200),
  description: Joi.string().trim().max(2000).allow(''),
}).min(1);

export const taskCreate = Joi.object({
  title: Joi.string().required().trim().min(1).max(300),
  description: Joi.string().trim().max(2000).allow(''),
  projectId: Joi.string().required().hex().length(24),
  assignedTo: Joi.string().hex().length(24).allow(null),
  status: Joi.string().valid('todo', 'in-progress', 'done'),
});

export const taskUpdate = Joi.object({
  title: Joi.string().trim().min(1).max(300),
  description: Joi.string().trim().max(2000).allow(''),
  status: Joi.string().valid('todo', 'in-progress', 'done'),
  assignedTo: Joi.string().hex().length(24).allow(null),
}).min(1);

export const messageCreate = Joi.object({
  content: Joi.string().required().trim().min(1).max(2000),
  teamId: Joi.string().required().hex().length(24),
});

export const assistantCommand = Joi.object({
  command: Joi.string().required().trim().min(1).max(1000),
  projectId: Joi.string().hex().length(24),
});

export const teamCreate = Joi.object({
  name: Joi.string().required().trim().min(1).max(200),
  description: Joi.string().trim().max(500).allow(''),
});

export const registerBody = Joi.object({
  name: Joi.string().required().trim().min(1).max(100),
  email: Joi.string().required().email().trim(),
  password: Joi.string().required().min(6).max(100),
});

export const loginBody = Joi.object({
  email: Joi.string().required().email().trim(),
  password: Joi.string().required(),
});

export const idParam = Joi.object({
  id: Joi.string().required().hex().length(24),
});
