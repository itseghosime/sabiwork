import { ArtisanVerificationStatusScreen } from "@/features/profiles/screens";
import { profilesDemoService } from "@/features/profiles/service";

export default async function ArtisanVerificationStatusPage() {
  const application = await profilesDemoService.getVerificationStatus("art-001");
  return <ArtisanVerificationStatusScreen initialApplication={application} />;
}
