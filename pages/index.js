// pages/index.js - redirects to dashboard
export default function Home() {
  return null;
}

export async function getServerSideProps() {
  return { redirect: { destination: '/dashboard', permanent: false } };
}
