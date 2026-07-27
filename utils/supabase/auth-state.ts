type AuthResult = { data: { user: unknown }; error: unknown };

export function canAccessProtectedRoute(result: AuthResult) {
  return !result.error && Boolean(result.data.user);
}
