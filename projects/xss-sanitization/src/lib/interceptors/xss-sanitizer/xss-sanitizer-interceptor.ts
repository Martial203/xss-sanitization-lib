import { HttpInterceptorFn } from '@angular/common/http';
import DOMPurify from 'dompurify';

function sanitizeObject<T>(obj: T): T {
  // Return early for primitive values or null
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  // Exclude native binary or global object instances to prevent data corruption
  if (
    obj instanceof Date ||
    obj instanceof RegExp ||
    obj instanceof Blob ||
    obj instanceof File ||
    obj instanceof ArrayBuffer
  ) {
    return obj;
  }

  // Handle arrays by recursively sanitizing each item
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item)) as unknown as T;
  }

  // Create a new, clean object preserving the original prototype to avoid direct mutations
  const sanitizedObj = Object.create(Object.getPrototypeOf(obj));

  // Use Reflect.ownKeys to capture all keys, including string and symbol properties
  for (const key of Reflect.ownKeys(obj)) {
    const keyStr = String(key);

    // Strictly block prototype pollution attempts without mutating the original object
    if (keyStr === '__proto__' || keyStr === 'constructor' || keyStr === 'prototype') {
      continue;
    }

    // TypeScript type assertion for safe dynamic access
    const val = (obj as Record<string | symbol, unknown>)[key];

    if (typeof val === 'string') {
      // DOMPurify is highly performant; sanitize all strings for security
      sanitizedObj[key] = DOMPurify.sanitize(val, { USE_PROFILES: { html: true } });
    } else if (val && typeof val === 'object') {
      // Recursively sanitize nested objects
      sanitizedObj[key] = sanitizeObject(val);
    } else {
      // Retain numbers, booleans, and other types as they are
      sanitizedObj[key] = val;
    }
  }

  return sanitizedObj as T;
}

export const xssSanitizerInterceptor: HttpInterceptorFn = (req, next) => {
  const body = req.body;

  // 1. Exclure les requêtes sans body, les FormData (upload de fichiers),
  // et les instances directes de Blob, File ou ArrayBuffer
  const isBinaryOrForm =
    body instanceof FormData ||
    body instanceof Blob ||
    body instanceof File ||
    body instanceof ArrayBuffer;

  // 2. N'assainir que si le body existe et n'est pas un fichier/FormData
  if (body && !isBinaryOrForm) {
    const clean = sanitizeObject(structuredClone(body));
    return next(req.clone({ body: clean }));
  }

  return next(req);
};
