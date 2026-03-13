import HomeScreenNoMCP from "@/screens/home-default";
import HomeScreenMCP from "@/screens/home-mcp";

export default function Home() {
  const isMCPEnabled = true;
  return isMCPEnabled ? <HomeScreenMCP /> : <HomeScreenNoMCP />;
}