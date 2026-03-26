import { getAppSurface, getPublicAppUrl } from '@/lib/routing/surfaces';
import NavbarClient from './NavbarClient';

export default async function Navbar() {
  const surface = getAppSurface();

  return (
    <NavbarClient
      accountHref={`${getPublicAppUrl()}/account?tab=buchungsverlauf`}
      showAccountEntry={surface === 'www'}
    />
  );
}
