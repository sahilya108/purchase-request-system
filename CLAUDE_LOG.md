# CLAUDE_LOG.md

# Claude Development Learning Log

## Project
Purchase Request System

## Purpose
Record important prompts, Claude suggestions, corrections,
and technical learning during project development.

---

## Session 1: Backend Development

### What I Asked
How to structure a Spring Boot REST API for a Purchase Request System.

### What Worked
Created backend APIs using Spring Boot and MySQL.

### What I Changed
Adjusted the implementation to match the existing project structure.

### What I Learned
- REST API development
- Spring Boot controllers and services
- Repository pattern
- Entity relationships

---

## Session 2: Authentication and Authorization

### What I Asked
How to implement role-based authentication for employees and managers.

### What Worked
Implemented JWT-based authentication and role-based access.

### What I Learned
- JWT authentication
- Spring Security
- Role-based authorization
- Secure API access

---

## Session 3: Purchase Request Management

### What I Asked
How to implement request creation, approval and rejection.

### What Worked
Implemented request management and team validation.

### What I Learned
- Service-layer validation
- Repository queries
- Approval workflows
- Email notifications

---

## Session 4: Request Filtering

### What I Asked
How to filter purchase requests by status, date range and Employee ID.

### What Worked
Implemented filtering through a backend API and connected it to React dashboards.

### What I Learned
- Spring Data JPA queries
- Request parameters
- React state management
- Date-range filtering

---

## Session 5: AI Assistant

### What I Asked
How to integrate a Gemini API-powered assistant into the application.

### What Worked
Implemented natural-language request queries with role-based data restrictions.

### What I Learned
- LLM API integration
- Prompt construction
- HTTP client requests
- Natural-language query handling

---

## What Claude Got Wrong

Record actual mistakes encountered during development.

Example:
- An initial Manager Dashboard update did not include the requested filter controls.
- I checked the actual source file and corrected the implementation.

## What I Improved Myself

Add your own corrections and changes here.

## Key Learning

I used Claude as a learning assistant, reviewed its suggestions,
tested the implementation and corrected issues rather than
blindly accepting generated code.