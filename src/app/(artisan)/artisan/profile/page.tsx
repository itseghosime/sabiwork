import { ArtisanProfileEditorScreen } from "@/features/profiles/screens";
import { defaultArtisan } from "@/features/profiles/service";

export default function ArtisanProfilePage() {
  return <ArtisanProfileEditorScreen initialProfile={defaultArtisan} />;
}
