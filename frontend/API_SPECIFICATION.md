# API Specification

## Auth
- POST `/auth/register` - { email, password, name } - Public
- POST `/auth/login` - { email, password } - Public
- POST `/auth/refresh` - { refreshToken } - Public
- GET `/auth/me` - Private

## Users
- GET `/users` - Private

## Projects
- GET `/projects` - Private
- GET `/projects/:id` - Private
- POST `/projects` - { title, description, status, priority, dueDate, teamMembers } - Private
- PATCH `/projects/:id` - { title, description, status, priority, dueDate, teamMembers } - Private
- DELETE `/projects/:id` - Private
- GET `/projects/stats` - Private

## Tasks
- GET `/tasks?projectId=...` - Private
- GET `/tasks/:id` - Private
- POST `/tasks` - { title, description, status, priority, dueDate, estimatedHours, projectId, assignedToId, tags } - Private
- PATCH `/tasks/:id` - { ...taskFields } - Private
- DELETE `/tasks/:id` - Private
- GET `/tasks/:id/comments` - Private
- POST `/tasks/:id/comments` - { content } - Private

## AI
- POST `/ai/task-summary` - { taskId } - Private
- POST `/ai/project-report` - { projectId } - Private
- POST `/ai/detect-risks` - { projectId } - Private
- POST `/ai/generate-subtasks` - { taskId } - Private
