// pages/index.js - redirects to dashboard or login
export default function Home() {
  return null;
}

export async function getServerSideProps({ req, res }) {
  const { getIronSession } = await import('iron-session');
  const { sessionOptions } = await import('../lib/session');
  const session = await getIronSession(req, res, sessionOptions);
  if (session.user) return { redirect: { destination: '/dashboard', permanent: false } };
  return { redirect: { destination: '/dashboard', permanent: false } };
}
