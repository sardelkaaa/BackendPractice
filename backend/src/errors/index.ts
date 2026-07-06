export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Ресурс не найден') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Доступ запрещён') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Конфликт данных') {
    super(message, 409, 'CONFLICT');
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Ошибка валидации') {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Не авторизован') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Внутренняя ошибка сервера') {
    super(message, 500, 'INTERNAL_SERVER_ERROR');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Не авторизован') {
    super(message, 401, 'UNAUTHORIZED');
  }
}