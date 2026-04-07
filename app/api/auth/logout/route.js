export async function POST() {
  // JWT is stateless — client just deletes the token
  return Response.json({ message: 'Logged out' });
}